import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/index.js";
import { processRagChat } from "../services/rag/rag.service.js";
import { getUserPrivateContext } from "../services/rag/userData.service.js";

/**
 * Handle incoming RAG chat message.
 * Supports both authenticated users (with their personal context) and guests.
 */
export const chatAssistant = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Message text is required");
  }

  try {
    const result = await processRagChat({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      user: req.user || null,
    });

    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, result, "AI response generated successfully"));
  } catch (error) {
    console.error("Error in chatAssistant controller:", error);
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message || "Failed to generate AI response. Please try again."
    );
  }
});

/**
 * Return starter questions / prompt suggestions based on user auth state.
 */
export const getAssistantSuggestions = asyncHandler(async (req, res) => {
  const isGuest = !req.user;

  const suggestions = isGuest
    ? [
        "How do I create and manage an event?",
        "What is the difference between participant code and member code?",
        "How does the Cricket scoring platform work?",
        "How do coding contests work with Judge0?",
        "How do campus clubs work?",
      ]
    : [
        "What events am I registered for?",
        "Show my hosted events and invite codes",
        "Which clubs do I belong to?",
        "What are my cricket player stats?",
        "Show my recent coding contest submissions",
      ];

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { suggestions, isGuest }, "Suggestions retrieved"));
});

/**
 * Return verified user's private activity summary (authenticated only).
 */
export const getUserPrivateSummary = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authentication required");
  }

  const context = await getUserPrivateContext(req.user._id);
  if (!context) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "User details could not be retrieved");
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          user: context.user,
          stats: context.stats,
        },
        "User summary retrieved successfully"
      )
    );
});
