import Router from "express";
import { EventMessage } from "../models/eventMessage.model.js";
import { Event } from "../models/event.model.js";
import { Member } from "../models/members.model.js";
import { Participant } from "../models/participant.model.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendEventMessage } from "../controllers/event.controller.js";
const router = Router();

// Get event chat messages with pagination
router.get("/:eventId", verifyJWT, sendEventMessage);

export default router;
