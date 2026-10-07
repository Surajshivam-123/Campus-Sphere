import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import ApiResponse from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/index.js";

/**
 * Rate limiter for OTP generation endpoints.
 * Limits to a maximum of 3 OTP requests per 15 minutes per email,
 * and a maximum of 5 OTP requests per 15 minutes per IP address.
 */
export const otpRateLimiter = [
  // 1. IP-level rate limit: max 5 requests per 15 mins per IP
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    handler: (req, res) => {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
        new ApiResponse(
          HTTP_STATUS.TOO_MANY_REQUESTS,
          null,
          "Too many OTP requests from this IP. Please try again after 15 minutes."
        )
      );
    },
  }),
  // 2. Email-level rate limit: max 3 requests per 15 mins per email
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const email = req.body?.email?.trim()?.toLowerCase();
      return email ? `otp:${email}` : ipKeyGenerator(req.ip);
    },
    handler: (req, res) => {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
        new ApiResponse(
          HTTP_STATUS.TOO_MANY_REQUESTS,
          null,
          "Too many OTP requests for this email. Please try again after 15 minutes."
        )
      );
    },
  }),
];

/**
 * Rate limiter for AI Assistant chat endpoint.
 * Limits to 30 requests per minute per IP address / authenticated user.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?._id?.toString();
    return userId ? `ai:user:${userId}` : ipKeyGenerator(req.ip);
  },
  handler: (req, res) => {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      new ApiResponse(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        null,
        "Too many AI requests. Please slow down and try again in a few moments."
      )
    );
  },
});

