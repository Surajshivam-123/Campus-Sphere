import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { Contest } from "../models/contest.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../../utils/redis.js";
import { getIO } from "../../../socket.js";

const CONTEST_TTL = 60;

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

const getContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const cacheKey = `contest:${eventId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, "Contest fetched"));

  const contest = await Contest.findOne({ event: eventId }).lean();
  if (contest) await cacheSet(cacheKey, contest, CONTEST_TTL);
  res.status(200).json(new ApiResponse(200, contest || null, "Contest fetched"));
});

const startContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const contest = await Contest.findOne({ event: eventId });
  if (!contest) throw new ApiError(404, "Contest not found. Save settings first.");

  const now = new Date();
  contest.status = "live";
  contest.startTime = now;
  contest.endTime = new Date(now.getTime() + contest.duration * 60 * 1000);
  await contest.save();

  await cacheDel(`contest:${eventId}`);

  const io = getIO();
  if (io) io.to(`event:${eventId}`).emit("contest:started", { eventId, endTime: contest.endTime });

  res.status(200).json(new ApiResponse(200, contest, "Contest started"));
});

const endContest = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const contest = await Contest.findOneAndUpdate(
    { event: eventId },
    { status: "ended" },
    { new: true }
  );
  if (!contest) throw new ApiError(404, "Contest not found");

  await cacheDel(`contest:${eventId}`);

  const io = getIO();
  if (io) io.to(`event:${eventId}`).emit("contest:ended", { eventId });

  res.status(200).json(new ApiResponse(200, contest, "Contest ended"));
});

export { saveContest, getContest, startContest, endContest };
