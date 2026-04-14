import asyncHandler from "../utils/AsyncHandler.js";
import { Event } from "../models/event.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";

const EVENT_TTL = 300;       // 5 min — single event
const EVENT_LIST_TTL = 120;  // 2 min — list of events (changes more often)

const generateUniqueCode = () => {
  let code = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  const length = characters.length;
  for (let i = 0; i < 5; i++) {
    code += characters.charAt(Math.floor(Math.random() * length));
  }
  return code;
};

const createEvent = asyncHandler(async (req, res) => {
  const {
    festivalName,
    eventName,
    startDate,
    location,
    organization,
    description,
    mode,
    category,
    sports,
    others,
    cultural,
    maxParticipants,
    rules,
  } = req.body;

  if (
    !eventName?.trim() ||
    !startDate?.trim() ||
    !organization?.trim() ||
    !description?.trim() ||
    !mode?.trim() ||
    !category?.trim() ||
    !maxParticipants
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const posterLocalPath = req.file?.path;
  if (!posterLocalPath) {
    throw new ApiError(400, "Poster is required");
  }

  const poster = await uploadOnCloudinary(posterLocalPath);
  if (!poster?.url) {
    throw new ApiError(500, "Failed to upload poster");
  }

  let memberCode = generateUniqueCode();
  let participantCode = generateUniqueCode();
  while (await Event.findOne({ memberCode })) memberCode = generateUniqueCode();
  while (await Event.findOne({ participantCode })) participantCode = generateUniqueCode();

  const event = await Event.create({
    festivalName,
    eventName,
    startDate,
    location,
    organization,
    organizer: req.user._id,
    description,
    mode,
    category,
    sports,
    cultural,
    others,
    maxParticipants,
    rules,
    poster: poster.url,
    memberCode,
    participantCode,
  });

  await cacheDel(`events:organizer:${req.user._id}`);
  res.status(201).json(new ApiResponse(201, event, "Event created successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findByIdAndDelete(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }
  await cacheDel(
    `event:${eventId}`,
    `events:organizer:${event.organizer}`
  );
  res
    .status(200)
    .json(new ApiResponse(200, event, "Event deleted successfully"));
});

const updateEvent = asyncHandler(async (req, res) => {
  try {
    const {
      festivalName,
      eventName,
      organization,
      mode,
      description,
      startDate,
      maxParticipants,
      rules,
    } = req.body;
    const { eventId } = req.params;
    if (!eventId) {
      throw new ApiError(400, "Event id is required");
    }
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    const posterfilePath = req.file?.path;
    let poster=null;
    if(posterfilePath){
      poster=await uploadOnCloudinary(posterfilePath);
    }
    if (poster) {
      event.poster = poster.url;
    }
    if (festivalName?.trim()) {
      event.festivalName = festivalName;
    }
    if (eventName?.trim()) {
      event.eventName = eventName;
    }
    if (organization?.trim()) {
      event.organization = organization;
    }
    if (mode?.trim()) {
      event.mode = mode;
    }
    if (description?.trim()) {
      event.description = description;
    }
    if (startDate) {
      event.startDate = startDate;
    }
    if (maxParticipants) {
      event.maxParticipants = maxParticipants;
    }
    if (rules) {
      event.rules = rules;
    }
    const updatedEvent = await Event.findByIdAndUpdate(eventId, event, { new: true });
    if (!updateEvent) {
      throw new ApiError(400, "Error while updating event");
    }
    await cacheDel(
      `event:${eventId}`,
      `events:organizer:${req.user._id}`
    );
    res
      .status(200)
      .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
  } catch (error) {
    console.log("Error while updating event", error);
  }
});

const getsingleEvent = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Event found successfully"));
    }

    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    await cacheSet(cacheKey, event, EVENT_TTL);
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event found successfully"));
  } catch (error) {
    console.log("Error while getting event", error);
  }
});

const getallEvents = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const cacheKey = `events:organizer:${userId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "All Events found successfully"));
    }

    const events = await Event.find({ organizer: userId });
    if (!events) {
      throw new ApiError(404, "Events not found");
    }
    await cacheSet(cacheKey, events, EVENT_LIST_TTL);
    res
      .status(200)
      .json(new ApiResponse(200, events, "All Events found successfully"));
  } catch (error) {
    console.log("Error while getting all events", error);
  }
});



// Public — no auth, returns all events (for spectators)
const getPublicEvents = asyncHandler(async (req, res) => {
  try {
    const cacheKey = "events:public";
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "Events fetched"));

    const events = await Event.find({})
      .select("eventName organization category sports startDate location poster festivalName")
      .sort({ startDate: -1 })
      .lean();

    await cacheSet(cacheKey, events, EVENT_LIST_TTL);
    res.status(200).json(new ApiResponse(200, events, "Events fetched"));
  } catch (error) {
    console.log("Error fetching public events", error);
    res.status(500).json(new ApiResponse(500, null, "Error fetching events"));
  }
});

// Assign a scorer updater — organizer only
const assignScorer = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    if (!userId) throw new ApiError(400, "userId is required");

    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found");
    if (event.organizer.toString() !== req.user._id.toString())
      throw new ApiError(403, "Only the organizer can assign a scorer");

    event.scorerUpdater = userId;
    await event.save();
    await cacheDel(`event:${eventId}`);
    res.status(200).json(new ApiResponse(200, { scorerUpdater: event.scorerUpdater }, "Scorer assigned"));
  } catch (error) {
    console.log("Error assigning scorer", error);
    throw error;
  }
});

// Revoke scorer — organizer only
const revokeScorer = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(404, "Event not found");
    if (event.organizer.toString() !== req.user._id.toString())
      throw new ApiError(403, "Only the organizer can revoke a scorer");

    event.scorerUpdater = null;
    await event.save();
    await cacheDel(`event:${eventId}`);
    res.status(200).json(new ApiResponse(200, null, "Scorer revoked"));
  } catch (error) {
    console.log("Error revoking scorer", error);
    throw error;
  }
});

export { createEvent, deleteEvent, updateEvent, getallEvents, getsingleEvent, getPublicEvents, assignScorer, revokeScorer };
