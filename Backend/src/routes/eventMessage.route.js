import express from "express";
import { EventMessage } from "../models/eventMessage.model.js";
import { Event } from "../models/event.model.js";
import { Member } from "../models/members.model.js";
import { Participant } from "../models/participant.model.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get event chat messages with pagination
router.get("/:eventId", verifyJWT, async (req, res) => {
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

export default router;
