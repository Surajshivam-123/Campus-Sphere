import { describe, it, expect, vi, beforeEach } from "vitest";
import userService from "../../src/services/user.service.js";
import { User } from "../../src/models/user.model.js";
import ApiError from "../../src/utils/ApiError.js";
import jwt from "jsonwebtoken";
import * as redisUtils from "../../src/utils/redis.js";
import * as mailerUtils from "../../src/utils/mailer.js";

vi.mock("../../src/models/user.model.js");
vi.mock("../../src/utils/cloudinary.js", () => ({
  uploadOnCloudinary: vi.fn().mockResolvedValue({ url: "https://cloud.url/avatar.png" }),
}));
vi.mock("../../src/utils/redis.js", () => ({
  cacheSet: vi.fn(),
  cacheGet: vi.fn(),
  cacheDel: vi.fn(),
}));
vi.mock("../../src/utils/mailer.js", () => ({
  sendOtpEmail: vi.fn().mockResolvedValue(true),
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  sendRegistrationOtpEmail: vi.fn().mockResolvedValue(true),
}));

describe("UserService", () => {
  const secret = process.env.ACCESS_TOKEN_SECRET || "test_access_token_secret_which_is_long_enough_123456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateTokens", () => {
    it("should generate tokens and save refreshToken on user", async () => {
      const mockUser = {
        generateAccessToken: vi.fn().mockReturnValue("mock_access_token"),
        generateRefreshToken: vi.fn().mockReturnValue("mock_refresh_token"),
        save: vi.fn().mockResolvedValue(true),
      };

      const tokens = await userService.generateTokens(mockUser);

      expect(tokens).toEqual({
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token",
      });
      expect(mockUser.refreshToken).toBe("mock_refresh_token");
      expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
    });

    it("should throw ApiError if user is not provided", async () => {
      await expect(userService.generateTokens(null)).rejects.toThrow(ApiError);
    });
  });

  describe("loginUser", () => {
    it("should throw ApiError if user is not found", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        userService.loginUser("nonexistent@example.com", "Password123!")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw ApiError if user has no password (Google auth only)", async () => {
      User.findOne.mockResolvedValue({
        email: "googleuser@example.com",
        password: null,
      });

      await expect(
        userService.loginUser("googleuser@example.com", "Password123!")
      ).rejects.toThrow("This account uses Google sign-in");
    });

    it("should throw ApiError if password does not match", async () => {
      User.findOne.mockResolvedValue({
        email: "user@example.com",
        password: "hashed_password",
        isPasswordCorrect: vi.fn().mockResolvedValue(false),
      });

      await expect(
        userService.loginUser("user@example.com", "WrongPassword")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should return user and tokens on successful login", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@example.com",
        password: "hashed_password",
        isPasswordCorrect: vi.fn().mockResolvedValue(true),
        generateAccessToken: vi.fn().mockReturnValue("access123"),
        generateRefreshToken: vi.fn().mockReturnValue("refresh123"),
        save: vi.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: "user123",
          email: "user@example.com",
        }),
      });

      const result = await userService.loginUser("user@example.com", "CorrectPassword123!");

      expect(result.accessToken).toBe("access123");
      expect(result.refreshToken).toBe("refresh123");
      expect(result.user).toBeDefined();
    });
  });

  describe("logoutUser", () => {
    it("should unset refreshToken in DB", async () => {
      User.findByIdAndUpdate.mockResolvedValue(true);

      await userService.logoutUser("user123");

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { $unset: { refreshToken: 1 } },
        { new: true }
      );
    });
  });

  describe("sendRegistrationOtp and verifyRegistrationOtp", () => {
    it("should throw error if email is already taken", async () => {
      User.findOne.mockResolvedValue({ email: "existing@example.com" });

      await expect(
        userService.sendRegistrationOtp("existing@example.com")
      ).rejects.toThrow("User with this email already exists");
    });

    it("should send registration OTP when email is new", async () => {
      User.findOne.mockResolvedValue(null);

      await userService.sendRegistrationOtp("newuser@example.com");

      expect(redisUtils.cacheSet).toHaveBeenCalled();
      expect(mailerUtils.sendRegistrationOtpEmail).toHaveBeenCalled();
    });

    it("should fail verifyRegistrationOtp if OTP is expired or invalid", async () => {
      redisUtils.cacheGet.mockResolvedValue(null);
      await expect(
        userService.verifyRegistrationOtp("user@example.com", "123456")
      ).rejects.toThrow("OTP expired or not requested");

      redisUtils.cacheGet.mockResolvedValue("654321");
      await expect(
        userService.verifyRegistrationOtp("user@example.com", "123456")
      ).rejects.toThrow("Invalid OTP");
    });

    it("should return verification token on valid OTP", async () => {
      redisUtils.cacheGet.mockResolvedValue("123456");

      const result = await userService.verifyRegistrationOtp("user@example.com", "123456");

      expect(result.verificationToken).toBeDefined();
      expect(redisUtils.cacheDel).toHaveBeenCalled();

      const decoded = jwt.verify(result.verificationToken, secret);
      expect(decoded.email).toBe("user@example.com");
      expect(decoded.purpose).toBe("email-verification");
    });
  });
});
