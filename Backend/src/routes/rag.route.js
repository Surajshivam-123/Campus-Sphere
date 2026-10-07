import { Router } from "express";
import { optionalVerifyJWT, verifyJWT } from "../middlewares/auth.middleware.js";
import { aiRateLimiter } from "../middlewares/rateLimit.middleware.js";
import {
  chatAssistant,
  getAssistantSuggestions,
  getUserPrivateSummary,
} from "../controllers/rag.controller.js";

const router = Router();

// Chat endpoint (rate limited + optional auth: personalized for logged-in users, general for guests)
router.route("/chat").post(optionalVerifyJWT, aiRateLimiter, chatAssistant);

// Suggestions endpoint
router.route("/suggestions").get(optionalVerifyJWT, getAssistantSuggestions);

// User private summary endpoint (requires valid login)
router.route("/my-summary").get(verifyJWT, getUserPrivateSummary);

export default router;
