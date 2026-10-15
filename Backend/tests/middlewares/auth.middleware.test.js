import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { verifyJWT, optionalVerifyJWT } from "../../src/middlewares/auth.middleware.js";
import { User } from "../../src/models/user.model.js";

vi.mock("../../src/models/user.model.js", () => ({
  User: {
    findById: vi.fn(),
  },
}));

describe("Auth Middleware", () => {
  const secret = process.env.ACCESS_TOKEN_SECRET || "test_access_token_secret_which_is_long_enough_123456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyJWT", () => {
    it("should return 401 if no token is provided", async () => {
      const req = { cookies: {}, header: vi.fn().mockReturnValue(null) };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await verifyJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "No token provided" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is expired", async () => {
      const expiredToken = jwt.sign({ _id: "user123" }, secret, { expiresIn: "-1s" });
      const req = {
        cookies: { accessToken: expiredToken },
        header: vi.fn().mockReturnValue(null),
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await verifyJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Token expired" })
      );
    });

    it("should return 401 if token is invalid", async () => {
      const req = {
        cookies: { accessToken: "invalid.token.structure" },
        header: vi.fn().mockReturnValue(null),
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await verifyJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Invalid token" })
      );
    });

    it("should return 401 if user does not exist in DB", async () => {
      const validToken = jwt.sign({ _id: "user123" }, secret, { expiresIn: "1h" });
      const req = {
        cookies: { accessToken: validToken },
        header: vi.fn().mockReturnValue(null),
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await verifyJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "User not found" })
      );
    });

    it("should attach user to req and call next() on valid token", async () => {
      const mockUser = { _id: "user123", username: "testuser", email: "test@example.com" };
      const validToken = jwt.sign({ _id: "user123" }, secret, { expiresIn: "1h" });
      const req = {
        cookies: {},
        header: vi.fn().mockReturnValue(`Bearer ${validToken}`),
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      await verifyJWT(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("optionalVerifyJWT", () => {
    it("should set req.user to null and call next if no token provided", async () => {
      const req = { cookies: {}, header: vi.fn().mockReturnValue(null) };
      const res = {};
      const next = vi.fn();

      await optionalVerifyJWT(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it("should set req.user and call next if valid token provided", async () => {
      const mockUser = { _id: "user123", username: "testuser" };
      const validToken = jwt.sign({ _id: "user123" }, secret, { expiresIn: "1h" });
      const req = {
        cookies: { accessToken: validToken },
        header: vi.fn().mockReturnValue(null),
      };
      const res = {};
      const next = vi.fn();

      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      await optionalVerifyJWT(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });
});
