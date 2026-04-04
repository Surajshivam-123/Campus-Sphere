import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { Member } from "../models/members.model.js";
import { Participant } from "../models/participant.model.js";
import { Team } from "../models/team.model.js";
import { Cricket_Player } from "../models/cricketPlayer.model.js";
import { Match } from "../models/match.model.js";

/**
 * Resolves eventId from either:
 *   req.params.eventId  — event-level routes
 *   req.params.matchId  — match-level routes (looks up the match)
 */
const resolveEventId = async (req) => {
  if (req.params.eventId) return req.params.eventId;
  if (req.params.matchId) {
    const match = await Match.findById(req.params.matchId).select("event").lean();
    return match?.event?.toString() || null;
  }
  return null;
};

/**
 * Allows access only if the logged-in user is:
 *   organiser | member | participant | cricket player (in a team for this event)
 */
export const verifyEventAccess = asyncHandler(async (req, res, next) => {
  try {
    const eventId = await resolveEventId(req);
    if (!eventId) {
      return res.status(400).json(new ApiResponse(400, null, "Event not found"));
    }

    const userId = req.user._id;

    // 1. Organiser
    const event = await Event.findById(eventId).select("organizer").lean();
    if (!event) return res.status(404).json(new ApiResponse(404, null, "Event not found"));
    if (event.organizer.toString() === userId.toString()) return next();

    // 2. Member
    const isMember = await Member.exists({ owner: userId, event: eventId });
    if (isMember) return next();

    // 3. Participant
    const isParticipant = await Participant.exists({ owner: userId, event: eventId });
    if (isParticipant) return next();

    // 4. Cricket player (via a team in this event)
    const teamIds = await Team.find({ event: eventId }).distinct("_id");
    const isPlayer = await Cricket_Player.exists({ owner: userId, team: { $in: teamIds } });
    if (isPlayer) return next();

    return res.status(403).json(new ApiResponse(403, null, "Access denied. You are not part of this event."));
  } catch (error) {
    console.log("verifyEventAccess error", error);
    return res.status(500).json(new ApiResponse(500, null, "Error checking event access"));
  }
});
