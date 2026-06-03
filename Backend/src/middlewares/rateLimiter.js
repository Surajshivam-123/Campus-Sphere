import rateLimit from "express-rate-limit";

// Helper: rate limiter factory
const createLimiter = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      statusCode: 429,
      message,
    },
    skipSuccessfulRequests: false,
  });

// Login: 10 attempts per 15 minutes
export const loginLimiter = createLimiter(
  15,
  10,
  "Too many login attempts. Please try again after 15 minutes."
);

// Register: 5 attempts per 60 minutes
export const registerLimiter = createLimiter(
  60,
  5,
  "Too many registration attempts. Please try again after 1 hour."
);

// OTP Send: 5 attempts per 10 minutes
export const otpSendLimiter = createLimiter(
  10,
  5,
  "Too many OTP requests. Please try again after 10 minutes."
);

// OTP Verify: 10 attempts per 10 minutes
export const otpVerifyLimiter = createLimiter(
  10,
  10,
  "Too many OTP verification attempts. Please try again after 10 minutes."
);

// Token Refresh: 20 attempts per 15 minutes
export const refreshTokenLimiter = createLimiter(
  15,
  20,
  "Too many token refresh attempts. Please try again after 15 minutes."
);