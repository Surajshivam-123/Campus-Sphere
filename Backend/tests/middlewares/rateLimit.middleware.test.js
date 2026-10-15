import { describe, it, expect } from "vitest";
import { otpRateLimiter, aiRateLimiter } from "../../src/middlewares/rateLimit.middleware.js";

describe("Rate Limit Middleware", () => {
  it("should define otpRateLimiter as an array of middlewares", () => {
    expect(Array.isArray(otpRateLimiter)).toBe(true);
    expect(otpRateLimiter.length).toBe(2);
    expect(typeof otpRateLimiter[0]).toBe("function");
    expect(typeof otpRateLimiter[1]).toBe("function");
  });

  it("should define aiRateLimiter middleware", () => {
    expect(typeof aiRateLimiter).toBe("function");
  });
});
