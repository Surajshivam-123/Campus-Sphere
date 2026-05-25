import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { Contest } from "../models/contest.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../../utils/redis.js";
import { getIO } from "../../../socket.js";

const CONTEST_TTL = 60;

const emit = (eventId, event, payload = {}) => {
  const io = getIO();
  if (io) io.to(`event:${eventId}`).emit(event, { eventId, ...payload });
};

// ── Save settings ─────────────────────────────────────────────────────────────
const saveContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { duration, allowedLanguages, scoringMode } = req.body;

  const contest = await Contest.findOneAndUpdate(
    { event: eventId },
    { event: eventId, duration, allowedLanguages, scoringMode, createdBy: req.user._id },
    { upsert: true, new: true }
  );

  await cacheDel(`contest:${eventId}`);
  res.status(200).json(new ApiResponse(200, contest, "Contest settings saved"));
});

// ── Get contest ───────────────────────────────────────────────────────────────
const getContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const cacheKey = `contest:${eventId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, "Contest fetched"));

  const contest = await Contest.findOne({ event: eventId }).lean();
  if (contest) await cacheSet(cacheKey, contest, CONTEST_TTL);
  res.status(200).json(new ApiResponse(200, contest || null, "Contest fetched"));
});

// ── Schedule ──────────────────────────────────────────────────────────────────
const scheduleContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { scheduledStartTime } = req.body;

  let scheduled = null;
  if (scheduledStartTime !== null && scheduledStartTime !== undefined) {
    scheduled = new Date(scheduledStartTime);
    if (isNaN(scheduled.getTime()) || scheduled <= new Date()) {
      throw new ApiError(400, "scheduledStartTime must be a valid future date");
    }
  }

  const contest = await Contest.findOneAndUpdate(
    { event: eventId },
    { $set: { scheduledStartTime: scheduled }, $setOnInsert: { event: eventId, createdBy: req.user._id } },
    { upsert: true, new: true }
  );

  await cacheDel(`contest:${eventId}`);
  emit(eventId, "contest:scheduled", { scheduledStartTime: scheduled });
  res.status(200).json(new ApiResponse(200, contest, scheduled ? "Contest scheduled" : "Schedule cleared"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const startContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const contest = await Contest.findOne({ event: eventId });
  if (!contest) throw new ApiError(404, "Contest not found. Save settings first.");
  if (contest.status === "live") throw new ApiError(400, "Contest is already live");

  const now = new Date();
  contest.status = "live";
  contest.startTime = now;
  contest.endTime = new Date(now.getTime() + contest.duration * 60 * 1000);
  contest.scheduledStartTime = undefined;
  contest.pausedAt = undefined;
  contest.totalPausedMs = 0;
  await contest.save();

  await cacheDel(`contest:${eventId}`);
  emit(eventId, "contest:started", { endTime: contest.endTime });
  res.status(200).json(new ApiResponse(200, contest, "Contest started"));
});

// ── Pause ─────────────────────────────────────────────────────────────────────
const pauseContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const contest = await Contest.findOne({ event: eventId });
  if (!contest) throw new ApiError(404, "Contest not found");
  if (contest.status !== "live") throw new ApiError(400, "Contest is not live");

  contest.status = "paused";
  contest.pausedAt = new Date();
  await contest.save();

  await cacheDel(`contest:${eventId}`);
  emit(eventId, "contest:paused", { pausedAt: contest.pausedAt });
  res.status(200).json(new ApiResponse(200, contest, "Contest paused"));
});

// ── Resume ────────────────────────────────────────────────────────────────────
const resumeContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const contest = await Contest.findOne({ event: eventId });
  if (!contest) throw new ApiError(404, "Contest not found");
  if (contest.status !== "paused") throw new ApiError(400, "Contest is not paused");

  const pausedDuration = Date.now() - new Date(contest.pausedAt).getTime();
  contest.totalPausedMs = (contest.totalPausedMs || 0) + pausedDuration;
  // Extend endTime by the time it was paused
  contest.endTime = new Date(new Date(contest.endTime).getTime() + pausedDuration);
  contest.status = "live";
  contest.pausedAt = undefined;
  await contest.save();

  await cacheDel(`contest:${eventId}`);
  emit(eventId, "contest:resumed", { endTime: contest.endTime });
  res.status(200).json(new ApiResponse(200, contest, "Contest resumed"));
});

// ── Extend ────────────────────────────────────────────────────────────────────
const extendContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { minutes } = req.body;
  if (!minutes || minutes <= 0) throw new ApiError(400, "minutes must be a positive number");

  const contest = await Contest.findOne({ event: eventId });
  if (!contest) throw new ApiError(404, "Contest not found");
  if (!["live", "paused"].includes(contest.status)) throw new ApiError(400, "Contest must be live or paused to extend");

  contest.endTime = new Date(new Date(contest.endTime).getTime() + minutes * 60 * 1000);
  contest.duration = contest.duration + minutes;
  await contest.save();

  await cacheDel(`contest:${eventId}`);
  emit(eventId, "contest:extended", { endTime: contest.endTime, addedMinutes: minutes });
  res.status(200).json(new ApiResponse(200, contest, `Contest extended by ${minutes} minutes`));
});

// ── End ───────────────────────────────────────────────────────────────────────
const endContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const contest = await Contest.findOneAndUpdate(
    { event: eventId },
    { status: "ended", pausedAt: undefined },
    { new: true }
  );
  if (!contest) throw new ApiError(404, "Contest not found");

  await cacheDel(`contest:${eventId}`);
  emit(eventId, "contest:ended");
  res.status(200).json(new ApiResponse(200, contest, "Contest ended"));
});

// ── Restart (live/paused → draft, keep settings) ──────────────────────────────
const restartContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const contest = await Contest.findOne({ event: eventId });
  if (!contest) throw new ApiError(404, "Contest not found");
  if (contest.status === "draft") throw new ApiError(400, "Contest is already in draft");

  contest.status = "draft";
  contest.startTime = undefined;
  contest.endTime = undefined;
  contest.pausedAt = undefined;
  contest.totalPausedMs = 0;
  contest.scheduledStartTime = undefined;
  await contest.save();

  await cacheDel(`contest:${eventId}`);
  emit(eventId, "contest:restarted");
  res.status(200).json(new ApiResponse(200, contest, "Contest reset to draft"));
});

export { saveContest, getContest, scheduleContest, startContest, pauseContest, resumeContest, extendContest, endContest, restartContest };
