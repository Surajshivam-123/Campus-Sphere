import { Member } from "../models/members.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { Event } from "../models/event.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

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
      event: event._id,
      role: "",
    });
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
    const event = await Event.findOne({ memberCode });
    if (!event) {
      return next(new ApiError(404, "Event not found while getting event"));
    }
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
    const events = await Member.find({ owner: req.user?._id });
    if (!events) {
      throw new ApiError(404, "Events Not found");
    }
    const allEvents = await Promise.all(
      events.map((event) => Event.findById(event.event))
    );
    // for (let i = 0; i < events.length; i++) {
    //   allEvents.push(await Event.findById(events[i].event));
    // }
    res
      .status(200)
      .json(new ApiResponse(200, allEvents, "All Events fetched successfully"));
  } catch (error) {
    console.log("Error while getting all events", error);
  }
});
export { participateEvent, getEvent, getAllEvents };
