import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/index.js";
import eventService from "../services/event.service.js";
import { aiGenerationService } from "../services/ai/aiGeneration.service.js";

/**
 * Event Controller - HTTP Interface Layer
 * Adheres strictly to Single Responsibility Principle (SRP):
 * Only handles HTTP inputs, delegates to EventService and AiGenerationService, and formats HTTP responses.
 */

const createEvent = asyncHandler(async (req, res) => {
  const posterLocalPath = req.file?.path;
  const event = await eventService.createEvent(req.body, req.user, posterLocalPath);

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, event, "Event created successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await eventService.deleteEvent(eventId, req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, event, "Event deleted successfully"));
});

const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const posterLocalPath = req.file?.path;
  const updatedEvent = await eventService.updateEvent(eventId, req.body, req.user._id, posterLocalPath);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, updatedEvent, "Event updated successfully"));
});

const getsingleEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await eventService.getEventById(eventId);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, event, "Event found successfully"));
});

const getallEvents = asyncHandler(async (req, res) => {
  const events = await eventService.getAllEventsByOrganizer(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, events, "All Events found successfully"));
});

const getPublicEvents = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const events = await eventService.getPublicEvents(search, category);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, events, "Events fetched"));
});

const assignScorer = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;
  const scorerUpdater = await eventService.assignScorer(eventId, userId, req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { scorerUpdater }, "Scorer assigned"));
});

const revokeScorer = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  await eventService.revokeScorer(eventId, req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Scorer revoked"));
});

const sendEventMessage = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { page, limit } = req.query;
  const result = await eventService.getEventMessages(eventId, req.user._id, page, limit);

  res.status(HTTP_STATUS.OK).json(result);
});

const generateEventPoster = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const url = await aiGenerationService.generateEventPoster(prompt);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { url }, "Poster generated successfully"));
});

const getEventMessages = sendEventMessage;

export {
  createEvent,
  deleteEvent,
  updateEvent,
  getallEvents,
  getsingleEvent,
  getPublicEvents,
  assignScorer,
  revokeScorer,
  sendEventMessage,
  getEventMessages,
  generateEventPoster,
};
