import { describe, it, expect, vi } from "vitest";
import { errorHandler, notFound } from "../../src/middlewares/error.middleware.js";
import ApiError from "../../src/utils/ApiError.js";

describe("Error Middleware", () => {
  describe("notFound", () => {
    it("should return 204 for /favicon.ico without forwarding error", () => {
      const req = { originalUrl: "/favicon.ico" };
      const res = {
        status: vi.fn().mockReturnThis(),
        end: vi.fn(),
      };
      const next = vi.fn();

      notFound(req, res, next);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should forward 404 ApiError to next() for unknown routes", () => {
      const req = { originalUrl: "/api/nonexistent" };
      const res = {};
      const next = vi.fn();

      notFound(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const passedError = next.mock.calls[0][0];
      expect(passedError).toBeInstanceOf(ApiError);
      expect(passedError.statusCode).toBe(404);
      expect(passedError.message).toContain("Route /api/nonexistent not found");
    });
  });

  describe("errorHandler", () => {
    it("should handle ApiError instances properly", () => {
      const apiError = new ApiError(403, "Access Denied", ["Not allowed"]);
      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      errorHandler(apiError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Access Denied",
          errors: ["Not allowed"],
        })
      );
    });

    it("should convert generic Error to 500 ApiError response", () => {
      const genericError = new Error("Database query failed");
      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      errorHandler(genericError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Database query failed",
        })
      );
    });
  });
});
