import asyncHandler from "../utils/AsyncHandler.js";
import { Event } from "../models/event.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";
import { Member } from "../models/members.model.js";
import { Participant } from "../models/participant.model.js";
import { EventMessage } from "../models/eventMessage.model.js";
import fs from "fs";
import path from "path";

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
    posterUrl,
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
  let finalPosterUrl = posterUrl || "";

  if (posterLocalPath) {
    const poster = await uploadOnCloudinary(posterLocalPath);
    if (!poster?.url) {
      throw new ApiError(500, "Failed to upload poster");
    }
    finalPosterUrl = poster.url;
  }

  if (!finalPosterUrl) {
    throw new ApiError(400, "Poster is required");
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
    poster: finalPosterUrl,
    memberCode,
    participantCode,
  });
  await Member.create({
    owner: req.user._id,
    name: req.user.fullname,
    role: "organizer",
    event: event._id
  })
  await cacheDel(`events:organizer:${req.user._id}`, "events:public");
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
    `events:organizer:${event.organizer}`,
    "events:public"
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
      posterUrl,
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
    let poster = null;
    if (posterfilePath) {
      poster = await uploadOnCloudinary(posterfilePath);
    }
    if (poster) {
      event.poster = poster.url;
    } else if (posterUrl) {
      event.poster = posterUrl;
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
    if (!updatedEvent) {
      throw new ApiError(400, "Error while updating event");
    }
    await cacheDel(
      `event:${eventId}`,
      `events:organizer:${req.user._id}`,
      "events:public"
    );
    res
      .status(200)
      .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
  } catch (error) {
    console.log("Error while updating event", error);
    throw error;
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
    throw error;
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
    throw error;
  }
});



// Public — no auth, returns all events (for spectators)
const getPublicEvents = asyncHandler(async (req, res) => {
  try {
    const { search, category } = req.query;

    const cacheKey = `events:public:search=${search || ""}:cat=${category || ""}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "Events fetched"));

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
        { location: searchRegex }
      ];
    }

    const events = await Event.find(query)
      .select("eventName description category sports startDate location poster festivalName memberCode organization")
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
const sendEventMessage = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    const event = await Event.findById(eventId).select("organizer").lean();
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const isOrganizer = event.organizer.toString() === userId.toString();
    const isMember = await Member.findOne({ event: eventId, owner: userId }).lean();
    const isParticipant = await Participant.findOne({ event: eventId, owner: userId }).lean();

    if (!isOrganizer && !isMember && !isParticipant) {
      return res.status(403).json({ error: "You are not authorized to view this chat." });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await EventMessage.find({ event: eventId, deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("sender", "fullname avatar")
      .lean();

    const total = await EventMessage.countDocuments({ event: eventId, deleted: false });

    res.json({
      messages: messages.reverse(),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("[event:chat:messages] error:", err.message);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

const generateEventPoster = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    throw new ApiError(400, "Prompt is required");
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    throw new ApiError(500, "Gemini API key is not configured");
  }

  try {
    const systemPrompt = `You are a professional SVG designer. Generate a stunning, beautiful, modern, and high-impact poster/banner SVG graphic for a campus event/festival based on the user's description.
                          Requirements:
                          - Return ONLY valid raw SVG XML code starting with '<svg' and ending with '</svg>'.
                          - Do not include markdown code block styling (such as \`\`\`xml or \`\`\`svg).
                          - Ensure it is a complete, self-contained SVG with standard namespaces (xmlns="http://www.w3.org/2000/svg"), viewBox="0 0 800 500" (landscape/banner aspect ratio), width, and height.
                          - Design a stunning, stylized vector banner matching the prompt: "${prompt}".
                          - Do not include any text explanation or extra whitespace before or after the SVG tag.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini poster API error:", geminiRes.status, errText);
      throw new Error(`Gemini API returned status ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    let rawSvg = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up markdown block wrapping if present
    rawSvg = rawSvg.replace(/```xml|```svg|```/gi, "").trim();

    if (!rawSvg.startsWith("<svg") && rawSvg.includes("<svg")) {
      rawSvg = rawSvg.substring(rawSvg.indexOf("<svg"));
    }
    if (rawSvg.includes("</svg>")) {
      rawSvg = rawSvg.substring(0, rawSvg.indexOf("</svg>") + 6);
    }

    if (!rawSvg || !rawSvg.startsWith("<svg")) {
      throw new Error("Failed to generate a valid SVG poster");
    }

    // Write temp SVG file
    const tempDir = path.resolve("./public/temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `eventposter-${Date.now()}.svg`);
    fs.writeFileSync(tempFilePath, rawSvg);

    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(tempFilePath);
    if (!uploadResult?.url) {
      throw new Error("Failed to upload poster to Cloudinary");
    }

    res
      .status(200)
      .json(new ApiResponse(200, { url: uploadResult.url }, "Poster generated successfully"));
  } catch (error) {
    console.error("Error in generateEventPoster:", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Failed to generate poster"));
  }
});

export { createEvent, deleteEvent, updateEvent, getallEvents, getsingleEvent, getPublicEvents, assignScorer, revokeScorer, sendEventMessage, generateEventPoster };
