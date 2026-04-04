import { User } from "../models/user.model.js";
import { Member } from "../models/members.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { Event } from "../models/event.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";

const MEMBER_TTL = 120;
const EVENT_TTL = 300;

const participateEvent = asyncHandler(async (req, res) => {
  try {
    const { invitationCode } = req.body;
    const event = await Event.findOne({ memberCode: invitationCode });
    if (!event) {
      res.status(404).json({ message: "Invalid Member Code" });
    }
    const memberExists = await Member.findOne({
      owner: req.user?._id,
      event: event._id,
    });
    if (memberExists) {
      res.status(400).json(new ApiResponse(400, {}, "Member already exists"));
    }
    const member = await Member.create({
      owner: req.user?._id,
      name: req.user?.fullname,
      event: event._id,
      role: "",
    });
    await cacheDel(
      `members:event:${event._id}`,
      `member:events:${req.user?._id}`
    );
    res
      .status(200)
      .json(new ApiResponse(200, member, "Event Joined successfully"));
  } catch (error) {
    console.log("Error while joining event", error);
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
      return next(new ApiError(404, "Event not found while getting event"));
    }
    await cacheSet(cacheKey, event, EVENT_TTL);
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event fetch successfully"));
  } catch (error) {
    console.log("Error while joining event as member", error);
    return next(new ApiError(500, "Internal Server Error"));
  }
});

const getAllEvents = asyncHandler(async (req, res) => {
  try {
    const cacheKey = `member:events:${req.user?._id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "All Events fetched successfully"));
    }

    const events = await Member.find({ owner: req.user?._id });
    if (!events) {
      throw new ApiError(404, "Events Not found");
    }
    // Use $in to avoid N+1 — fetch all events in one query
    const eventIds = events.map((e) => e.event);
    const allEvents = await Event.find({ _id: { $in: eventIds } });

    await cacheSet(cacheKey, allEvents, MEMBER_TTL);
    res
      .status(200)
      .json(new ApiResponse(200, allEvents, "All Events fetched successfully"));
  } catch (error) {
    console.log("Error while getting all events", error);
  }
});

const editRole = asyncHandler(async (req, res) => {
  try {
    const { memberId } = req.params;
    if(!memberId){
      throw new ApiError(400,"Member id is required")
    }
    const { role } = req.body;
    const member = await Member.findByIdAndUpdate(memberId, { role }, { new: true });
    if (!member) {
      throw new ApiError(404, "Member not found");
    }
    await cacheDel(`members:event:${member.event}`);
    res
      .status(200)
      .json(new ApiResponse(200, member, "Role updated successfully"));
  } catch (error) {
    console.log("Error while editing role", error);
  }
});

const getMember = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `members:event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "All Member fetched successfully"));
    }

    const [members, event] = await Promise.all([
      Member.find({ event: eventId }),
      Event.findById(eventId).populate("organizer", "fullname username"),
    ]);

    if (!members) {
      throw new ApiError(404, "Member not found");
    }

    const ownerName = event?.organizer?.fullname || event?.organizer?.username || req?.user?.fullname;

    // Include organizer as a member entry if not already in the list
    const organizerId = event?.organizer?._id?.toString();
    const alreadyInList = members.some((m) => m.owner?.toString() === organizerId);

    let allMembers = [...members];
    if (!alreadyInList && organizerId) {
      allMembers = [
        {
          _id: event.organizer._id,
          name: ownerName,
          role: "Organizer",
          owner: event.organizer._id,
          isOrganizer: true,
        },
        ...allMembers,
      ];
    }

    const result = { members: allMembers, ownerName };
    await cacheSet(cacheKey, result, MEMBER_TTL);
    res
      .status(200)
      .json(new ApiResponse(200, result, "All Member fetched successfully"));
  } catch (error) {
    console.log("Error while getting all members", error);
  }
});



export {
  participateEvent,
  getEvent,
  getAllEvents,
  editRole,
  getMember,
};
