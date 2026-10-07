import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getEventMessages } from "../controllers/event.controller.js";

const router = Router();

// Get event chat messages with pagination
router.get("/:eventId", verifyJWT, getEventMessages);

export default router;
