import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { ContestFormat } from "../models/contestFormat.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../../utils/redis.js";

const FORMAT_TTL = 120;

// ── Save / update contest format ──────────────────────────────────────────────
export const saveContestFormat = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { durationMinutes, startTime, scoringType, allowedLanguages, maxAttempts, showLeaderboard } = req.body;

  if (!durationMinutes || !startTime) throw new ApiError(400, "Duration and start time are required");

  const format = await ContestFormat.findOneAndUpdate(
    { event: eventId },
    { event: eventId, durationMinutes, startTime: new Date(startTime), scoringType, allowedLanguages, maxAttempts, showLeaderboard, createdBy: req.user._id },
    { upsert: true, new: true }
  );

  await cacheDel(`contestFormat:event:${eventId}`);
  res.status(200).json(new ApiResponse(200, format, "Contest format saved"));
});

// ── Get contest format ────────────────────────────────────────────────────────
export const getContestFormat = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const cacheKey = `contestFormat:event:${eventId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, "Format fetched"));

  const format = await ContestFormat.findOne({ event: eventId }).lean();
  if (format) await cacheSet(cacheKey, format, FORMAT_TTL);

  res.status(200).json(new ApiResponse(200, format || null, "Format fetched"));
});
