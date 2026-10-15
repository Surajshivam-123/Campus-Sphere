import { Event } from "../models/event.model.js";
import { Member } from "../models/members.model.js";
import { Participant } from "../models/participant.model.js";
import { EventMessage } from "../models/eventMessage.model.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";
import { storageService } from "./storage/storage.service.js";

const EVENT_TTL = 300;       // 5 min — single event
const EVENT_LIST_TTL = 120;  // 2 min — list of events

const generateUniqueCode = () => {
  let code = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  const length = characters.length;
  for (let i = 0; i < 5; i++) {
    code += characters.charAt(Math.floor(Math.random() * length));
  }
  return code;
};

/**
 * EventService - Business logic for Event operations
 * Adheres to:
 * - Single Responsibility Principle (SRP): Isolates data querying, cache management, and event business rules from HTTP controllers.
 * - Dependency Inversion Principle (DIP): Uses storageService abstraction for poster uploads.
 */
class EventService {
  constructor(storage = storageService) {
    this.storage = storage;
  }

  async createEvent(eventData, organizer, posterFilePath) {
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
      posterUrl,
    } = eventData;

    if (
      !eventName?.trim() ||
      !startDate?.toString()?.trim() ||
      !organization?.trim() ||
      !description?.trim() ||
      !mode?.trim() ||
      !category?.trim() ||
      !maxParticipants
    ) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "All fields are required");
    }

    let finalPosterUrl = posterUrl || "";
    if (posterFilePath) {
      const uploadResult = await this.storage.uploadFile(posterFilePath);
      if (!uploadResult?.url) {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to upload poster");
      }
      finalPosterUrl = uploadResult.url;
    }

    if (!finalPosterUrl) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Poster is required");
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
      organizer: organizer._id,
      description,
      mode,
      category,
      sports,
      cultural,
      others,
      maxParticipants,
      rules,
      poster: finalPosterUrl,
      memberCode,
      participantCode,
    });

    await Member.create({
      owner: organizer._id,
      name: organizer.fullname,
      role: "organizer",
      event: event._id,
    });

    await cacheDel(`events:organizer:${organizer._id}`, "events:public");
    return event;
  }

  async getEventById(eventId) {
    const cacheKey = `event:${eventId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");
    }

    await cacheSet(cacheKey, event, EVENT_TTL);
    return event;
  }

  async getAllEventsByOrganizer(organizerId) {
    const cacheKey = `events:organizer:${organizerId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const events = await Event.find({ organizer: organizerId });
    if (!events) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Events not found");
    }

    await cacheSet(cacheKey, events, EVENT_LIST_TTL);
    return events;
  }

  async getPublicEvents(search = "", category = "") {
    const cacheKey = `events:public:search=${search || ""}:cat=${category || ""}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const query = {};
    if (category && category !== "all") {
      query.category = category;
    }
    if (search && search.trim() !== "") {
      const cleanSearch = search.trim();
      const searchRegex = new RegExp(cleanSearch, "i");
      query.$or = [
        { eventName: searchRegex },
        { description: searchRegex },
        { festivalName: searchRegex },
        { sports: searchRegex },
        { cultural: searchRegex },
        { others: searchRegex },
        { organization: searchRegex },
        { location: searchRegex },
      ];
    }

    const events = await Event.find(query)
      .select("eventName description category sports startDate location poster festivalName memberCode organization")
      .sort({ startDate: -1 })
      .lean();

    await cacheSet(cacheKey, events, EVENT_LIST_TTL);
    return events;
  }

  async updateEvent(eventId, updateData, userId, posterFilePath) {
    if (!eventId) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Event id is required");

    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");

    if (event.organizer.toString() !== userId.toString()) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only the event organizer can perform this action");
    }

    if (posterFilePath) {
      const uploadResult = await this.storage.uploadFile(posterFilePath);
      if (uploadResult?.url) {
        event.poster = uploadResult.url;
      }
    } else if (updateData.posterUrl) {
      event.poster = updateData.posterUrl;
    }

    const fields = [
      "festivalName",
      "eventName",
      "organization",
      "mode",
      "description",
      "startDate",
      "maxParticipants",
      "rules",
    ];

    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        event[field] = updateData[field];
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(eventId, event, { new: true });
    if (!updatedEvent) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Error while updating event");
    }

    await cacheDel(`event:${eventId}`, `events:organizer:${userId}`, "events:public");
    return updatedEvent;
  }

  async deleteEvent(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");

    if (event.organizer.toString() !== userId.toString()) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only the event organizer can perform this action");
    }

    await Event.findByIdAndDelete(eventId);
    await cacheDel(
      `event:${eventId}`,
      `events:organizer:${event.organizer}`,
      "events:public"
    );
    return event;
  }

  async assignScorer(eventId, targetUserId, organizerId) {
    if (!targetUserId) throw new ApiError(HTTP_STATUS.BAD_REQUEST, "userId is required");

    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");

    if (event.organizer.toString() !== organizerId.toString()) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only the organizer can assign a scorer");
    }

    event.scorerUpdater = targetUserId;
    await event.save();
    await cacheDel(`event:${eventId}`);
    return event.scorerUpdater;
  }

  async revokeScorer(eventId, organizerId) {
    const event = await Event.findById(eventId);
    if (!event) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");

    if (event.organizer.toString() !== organizerId.toString()) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only the organizer can revoke a scorer");
    }

    event.scorerUpdater = null;
    await event.save();
    await cacheDel(`event:${eventId}`);
  }

  async getEventMessages(eventId, userId, page = 1, limit = 50) {
    const event = await Event.findById(eventId).select("organizer").lean();
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Event not found");
    }

    const isOrganizer = event.organizer.toString() === userId.toString();
    const isMember = await Member.findOne({ event: eventId, owner: userId }).lean();
    const isParticipant = await Participant.findOne({ event: eventId, owner: userId }).lean();

    if (!isOrganizer && !isMember && !isParticipant) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "You are not authorized to view this chat");
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const messages = await EventMessage.find({ event: eventId, deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate("sender", "fullname avatar")
      .lean();

    const total = await EventMessage.countDocuments({ event: eventId, deleted: false });

    return {
      messages: messages.reverse(),
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
    };
  }
}

export default new EventService();
