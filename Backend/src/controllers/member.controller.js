import { Member } from "../models/members.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { Event } from "../models/event.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";
import { submitJoinRequest, respondToRequest, getPendingRequests } from "../services/joinRequest.service.js";

const MEMBER_TTL = 120;
const EVENT_TTL = 300;

// POST /members/participate/:memberCode
// User submits a join request using the member code
const participateEvent = asyncHandler(async (req, res) => {
  try {
    const { memberCode } = req.params;

    const event = await Event.findOne({ memberCode });
    if (!event) {
      return res.status(404).json(new ApiResponse(404, null, "Invalid Member Code"));
    }

    if (event.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json(new ApiResponse(400, null, "You are the organizer of this event"));
    }

    const memberExists = await Member.findOne({ owner: req.user._id, event: event._id });
    if (memberExists) {
      return res.status(400).json(new ApiResponse(400, null, "You are already a member of this event"));
    }

    const result = await submitJoinRequest("member", {
      eventId: event._id,
      requesterId: req.user._id,
      requesterName: req.user.fullname || req.user.username,
      organizerId: event.organizer,
      eventName: event.eventName,
    });

    if (result.conflict) {
      const statusCode = result.status === "pending" ? 200 : 400;
      return res.status(statusCode).json(
        new ApiResponse(statusCode, { status: result.status }, `Request already ${result.status}`)
      );
    }

    return res.status(201).json(new ApiResponse(201, { status: "pending" }, "Join request sent. Waiting for organizer approval."));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(new ApiResponse(400, null, "You have already sent a request for this event."));
    }
    console.log("Error while sending join request", error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

// GET /members/join-requests/:eventId
// Organizer fetches all pending join requests for their event
const getJoinRequests = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).select("organizer");
    if (!event) {
      return res.status(404).json(new ApiResponse(404, null, "Event not found"));
    }
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json(new ApiResponse(403, null, "Only the organizer can view join requests"));
    }

    const requests = await getPendingRequests("member", { eventId });
    return res.status(200).json(new ApiResponse(200, requests, "Join requests fetched successfully"));
  } catch (error) {
    console.log("Error fetching join requests", error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

// PATCH /members/join-requests/handle/:requestId
// Organizer approves or rejects a join request
const handleJoinRequest = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json(new ApiResponse(400, null, "Action must be 'approve' or 'reject'"));
    }

    const result = await respondToRequest(requestId, action, req.user._id);

    if (result.notFound) return res.status(404).json(new ApiResponse(404, null, "Join request not found"));
    if (result.forbidden) return res.status(403).json(new ApiResponse(403, null, "Only the organizer can handle join requests"));
    if (result.alreadyHandled) return res.status(400).json(new ApiResponse(400, null, `Request already ${result.status}`));

    return res.status(200).json(new ApiResponse(200, { status: result.status, member: result.created }, `Request ${result.status} successfully`));
  } catch (error) {
    console.log("Error handling join request", error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getEvent = asyncHandler(async (req, res, next) => {
  try {
    const { memberCode } = req.params;
    const cacheKey = `event:memberCode:${memberCode}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Event fetch successfully"));
    }

    const event = await Event.findOne({ memberCode });
    if (!event) {
      return next(new ApiError(404, "Event not found"));
    }
    await cacheSet(cacheKey, event, EVENT_TTL);
    return res.status(200).json(new ApiResponse(200, event, "Event fetch successfully"));
  } catch (error) {
    console.log("Error while getting event by member code", error);
    return next(new ApiError(500, "Internal Server Error"));
  }
});

const getAllEvents = asyncHandler(async (req, res) => {
  try {
    const cacheKey = `member:events:${req.user._id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "All Events fetched successfully"));
    }

    const memberships = await Member.find({ owner: req.user._id, role: { $ne: "organizer" } });
    const eventIds = memberships.map((m) => m.event);
    const allEvents = await Event.find({ _id: { $in: eventIds } });

    await cacheSet(cacheKey, allEvents, MEMBER_TTL);
    return res.status(200).json(new ApiResponse(200, allEvents, "All Events fetched successfully"));
  } catch (error) {
    console.log("Error while getting all events", error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const editRole = asyncHandler(async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!memberId) throw new ApiError(400, "Member id is required");

    const { role } = req.body;
    const member = await Member.findByIdAndUpdate(memberId, { role }, { new: true });
    if (!member) throw new ApiError(404, "Member not found");

    await cacheDel(`members:event:${member.event}`);
    return res.status(200).json(new ApiResponse(200, member, "Role updated successfully"));
  } catch (error) {
    console.log("Error while editing role", error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getMember = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `members:event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "All Members fetched successfully"));
    }

    const [members, event] = await Promise.all([
      Member.find({ event: eventId }).populate("owner", "fullname username avatar"),
      Event.findById(eventId).populate("organizer", "fullname username avatar"),
    ]);

    if (!members) throw new ApiError(404, "Members not found");

    const organizerId = event?.organizer?._id?.toString();
    const ownerName = event?.organizer?.fullname || event?.organizer?.username;

    // Normalize members — use populated owner name, fallback to stored name
    const allMembers = members.map((m) => {
      const isOrg = m.owner?._id?.toString() === organizerId || m.role === "organizer";
      return {
        _id: m._id,
        owner: m.owner,
        name: m.owner?.fullname || m.owner?.username || m.name || "Unknown",
        role: isOrg ? "Organizer" : m.role,
        isOrganizer: isOrg ? true : undefined,
      };
    });

    const result = { members: allMembers, ownerName };
    await cacheSet(cacheKey, result, MEMBER_TTL);
    return res.status(200).json(new ApiResponse(200, result, "All Members fetched successfully"));
  } catch (error) {
    console.log("Error while getting all members", error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

export { participateEvent, getEvent, getAllEvents, editRole, getMember, getJoinRequests, handleJoinRequest };
