import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { Team } from "../../../models/team.model.js";
import { Event } from "../../../models/event.model.js";
import { Cricket_Player } from "../models/player.model.js";
import { JoinRequest } from "../../../models/joinRequest.model.js";
import { submitJoinRequest, respondToRequest, getPendingRequests } from "../../../services/joinRequest.service.js";

// POST /request-join/:teamCode/:eventId
const requestJoinTeam = asyncHandler(async (req, res) => {
  try {
    const { teamCode, eventId } = req.params;

    const team = await Team.findOne({ teamCode, event: eventId });
    if (!team) {
      return res.status(404).json(new ApiResponse(404, null, "Team not found. Check the team code."));
    }
    if (team.owner.toString() === req.user._id.toString()) {
      return res.status(400).json(new ApiResponse(400, null, "You are the captain of this team."));
    }

    const alreadyPlayer = await Cricket_Player.findOne({ team: team._id, owner: req.user._id });
    if (alreadyPlayer) {
      return res.status(400).json(new ApiResponse(400, null, "You are already in this team."));
    }

    const result = await submitJoinRequest("team", {
      eventId,
      requesterId: req.user._id,
      requesterName: req.user.fullname || req.user.username,
      team,
      captainId: team.owner,
    });

    if (result.conflict) {
      return res.status(400).json(new ApiResponse(400, { status: result.status }, `Request already ${result.status}.`));
    }

    return res.status(201).json(new ApiResponse(201, { status: "pending" }, "Join request sent. Waiting for captain's approval."));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(new ApiResponse(400, null, "You have already sent a request to this team."));
    }
    console.log("Error sending join request", error);
    return res.status(500).json(new ApiResponse(500, null, "Error sending join request"));
  }
});

// GET /join-requests/:eventId — captain fetches pending requests for their team
const getJoinRequests = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const team = await Team.findOne({ event: eventId, owner: req.user._id });
    if (!team) {
      return res.status(404).json(new ApiResponse(404, null, "You don't have a team in this event."));
    }

    const requests = await getPendingRequests("team", { teamId: team._id });
    return res.status(200).json(new ApiResponse(200, requests, "Join requests fetched"));
  } catch (error) {
    console.log("Error fetching join requests", error);
    return res.status(500).json(new ApiResponse(500, null, "Error fetching join requests"));
  }
});

// PATCH /join-requests/:requestId — captain approves or rejects
const respondToJoinRequest = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json(new ApiResponse(400, null, "Action must be 'approve' or 'reject'."));
    }

    const result = await respondToRequest(requestId, action, req.user._id);

    if (result.notFound)       return res.status(404).json(new ApiResponse(404, null, "Request not found."));
    if (result.forbidden)      return res.status(403).json(new ApiResponse(403, null, "Only the team captain can approve or reject requests."));
    if (result.alreadyHandled) return res.status(400).json(new ApiResponse(400, null, `Request already ${result.status}.`));

    return res.status(200).json(new ApiResponse(200, { status: result.status }, `Request ${result.status} successfully.`));
  } catch (error) {
    console.log("Error responding to join request", error);
    return res.status(500).json(new ApiResponse(500, null, "Error responding to join request"));
  }
});

// GET /join-request-status/:teamCode/:eventId — player checks their own request status
const getMyRequestStatus = asyncHandler(async (req, res) => {
  try {
    const { teamCode, eventId } = req.params;

    const team = await Team.findOne({ teamCode, event: eventId });
    if (!team) {
      return res.status(404).json(new ApiResponse(404, null, "Team not found."));
    }

    const joinReq = await JoinRequest.findOne({ type: "team", team: team._id, requester: req.user._id });
    if (!joinReq) {
      return res.status(200).json(new ApiResponse(200, { status: null }, "No request found."));
    }

    return res.status(200).json(new ApiResponse(200, { status: joinReq.status, teamName: team.name }, "Status fetched."));
  } catch (error) {
    console.log("Error fetching request status", error);
    return res.status(500).json(new ApiResponse(500, null, "Error fetching status"));
  }
});

export { requestJoinTeam, getJoinRequests, respondToJoinRequest, getMyRequestStatus };

// GET /event-join-requests/:eventId — organizer fetches ALL pending team join requests for their event
export const getEventJoinRequests = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).select("organizer").lean();
    if (!event) return res.status(404).json(new ApiResponse(404, null, "Event not found"));
    if (event.organizer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Only the event organizer can view all join requests");
    }

    const teams = await Team.find({ event: eventId }).select("_id name").lean();
    const teamIds = teams.map((t) => t._id);

    const requests = await JoinRequest.find({
      type: "team",
      team: { $in: teamIds },
      status: "pending",
    })
      .populate("requester", "fullname username avatar")
      .populate("team", "name teamCode")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(new ApiResponse(200, requests, "Join requests fetched"));
  } catch (error) {
    console.log("Error fetching event join requests", error);
    throw error;
  }
});
