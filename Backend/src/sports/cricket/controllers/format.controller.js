import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { CricketFormat } from "../models/format.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../../utils/redis.js";

const FORMAT_TTL = 300;

const saveFormat = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { tournamentType, overs, playersPerTeam } = req.body;

    if (!tournamentType || !overs || !playersPerTeam) {
      throw new ApiError(400, "All fields are required");
    }

    const format = await CricketFormat.findOneAndUpdate(
      { event: eventId },
      { tournamentType, overs, playersPerTeam, createdBy: req.user._id, event: eventId },
      { upsert: true, new: true }
    );

    await cacheDel(`cricketFormat:event:${eventId}`);
    res.status(200).json(new ApiResponse(200, format, "Format saved successfully"));
  } catch (error) {
    console.log("Error while saving cricket format", error);
    throw error;
  }
});

const getFormat = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `cricketFormat:event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Format fetched successfully"));
    }

    const format = await CricketFormat.findOne({ event: eventId });
    if (format) await cacheSet(cacheKey, format, FORMAT_TTL);
    res.status(200).json(new ApiResponse(200, format || null, "Format fetched successfully"));
  } catch (error) {
    console.log("Error while getting cricket format", error);
    throw error;
  }
});

export { saveFormat, getFormat };
