import { Participant } from "../models/participant.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { Team } from "../models/team.model.js";
import { Cricket_Player } from "../sports/cricket/models/player.model.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";

const PARTICIPANT_TTL = 120;
const EVENT_TTL = 300;

const participateEvent = asyncHandler(async (req, res) => {
  try {
    const { invitationCode, identityNumber } = req.body;
    if (!invitationCode?.trim() || !identityNumber?.trim()) {
      throw new ApiError(400, "All fields are required");
    }
    const event = await Event.findOne({ participantCode: invitationCode.trim() });
    if (!event) {
      return res.status(404).json(new ApiResponse(404, null, "Event not found"));
    }

    const participantExists = await Participant.findOne({
      event: event._id,
      identityNumber: identityNumber.trim()
    });
    if (participantExists) {
      return res.status(400).json(new ApiResponse(400, {}, "Participant already exists"));
    }

    const participant = await Participant.create({
      owner: req.user?._id,
      event: event._id,
      identityNumber: identityNumber.trim(),
    });
    if (!participant) {
      throw new ApiError(400, "Error while creating participant");
    }
    await cacheDel(
      `participants:event:${event._id}`,
      `participant:myevents:${req.user?._id}`
    );
    return res
      .status(201)
      .json(
        new ApiResponse(201, participant, "Participant created successfully")
      );
  } catch (error) {
    console.log("Error while creating participant", error);
    throw error;
  }
});

const getEvent = asyncHandler(async (req, res) => {
  try {
    const { participantCode } = req.params;
    if (!participantCode.trim()) {
      throw new ApiError(400, "Participant code is required");
    }
    const cacheKey = `event:participantCode:${participantCode}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Event found successfully"));
    }

    const event = await Event.findOne({ participantCode: participantCode.trim() });
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    await cacheSet(cacheKey, event, EVENT_TTL);
    return res
      .status(200)
      .json(new ApiResponse(200, event, "Event found successfully"));
  } catch (error) {
    console.log("Error while getting event", error);
    throw error;
  }
});

const getMyEvent = asyncHandler(async (req, res) => {
  try {
    const cacheKey = `participant:myevents:${req.user._id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Events found successfully"));
    }

    const participate = await Participant.find({ owner: req.user._id });
    if (!participate || participate.length === 0) {
      return res.status(200).json(new ApiResponse(200, [], "Events found successfully"));
    }
    // Use $in to avoid N+1
    const eventIds = participate.map((p) => p.event);
    const myEvent = await Event.find({ _id: { $in: eventIds } });

    await cacheSet(cacheKey, myEvent, PARTICIPANT_TTL);
    return res
      .status(200)
      .json(new ApiResponse(200, myEvent, "Events found successfully"));
  } catch (error) {
    console.log("Error while getting my events", error);
    throw error;
  }
});

const getAllParticipant = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `participants:event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Participants found successfully"));
    }

    const participants = await Participant.find({ event: eventId }).populate("owner", "fullname username");
    if (!participants) {
      throw new ApiError(404, "Participants not found")
    }

    // Get all teams for this event and all cricket players in those teams
    const teams = await Team.find({ event: eventId }).select("_id name owner").lean();
    const teamIds = teams.map(t => t._id);
    const players = await Cricket_Player.find({ team: { $in: teamIds } }).select("owner team").lean();

    // Build lookup maps
    const captainMap = {}; // userId -> team name (captain = team owner)
    teams.forEach(t => { captainMap[t.owner.toString()] = t.name; });

    const playerMap = {}; // userId -> team name (via cricket player)
    players.forEach(p => {
      const team = teams.find(t => t._id.toString() === p.team.toString());
      if (team) playerMap[p.owner.toString()] = team.name;
    });

    const enriched = participants.map(p => {
      const uid = p.owner?._id?.toString();
      const teamName = captainMap[uid] || playerMap[uid] || null;
      return {
        _id: p._id,
        owner: p.owner,
        identityNumber: p.identityNumber,
        teamName,
        isCaptain: !!captainMap[uid],
      };
    });

    await cacheSet(cacheKey, enriched, PARTICIPANT_TTL);
    return res.status(200).json(new ApiResponse(200, enriched, "Participants found successfully"))
  } catch (error) {
    console.log("Error while getting all participants", error);
    throw error;
  }
});

const getSingleParticipant = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const participants = await Participant.find({ event: eventId, owner: req.user._id });
    if (!participants) {
      throw new ApiError(404, "Participants not found")
    }
    return res.status(200).json(new ApiResponse(200, participants, "Participants found successfully"))
  } catch (error) {
    console.log("Error while getting single participants", error);
    throw error;
  }
});

const deleteParticipant = asyncHandler(async (req, res) => {
  try {
    const participantId = req.params.participantId;
    const participant = await Participant.findByIdAndDelete(participantId);
    if (!participant) {
      throw new ApiError(400, "Participation is Not deleted");
    }
    await cacheDel(
      `participants:event:${participant.event}`,
      `participant:myevents:${participant.owner}`
    );
    return res.status(200).json(new ApiResponse(200, "Participant is deleted successfully"));
  } catch (error) {
    console.log("Error while deleting Participant:", error);
    throw error;
  }
});
export { participateEvent, getEvent, getMyEvent, getAllParticipant, getSingleParticipant, deleteParticipant };
