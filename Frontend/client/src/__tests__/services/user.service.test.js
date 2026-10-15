import { describe, it, expect, vi, beforeEach } from "vitest";
import userService from "../../services/user.service.js";
import apiClient from "../../services/api.service.js";

vi.mock("../../services/api.service.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  setForceLogoutHandler: vi.fn(),
}));

describe("UserService (Frontend)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call login endpoint and store token in localStorage", async () => {
      const mockResponse = {
        data: {
          accessToken: "mock_jwt_token",
          user: { id: "1", username: "john" },
        },
      };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await userService.login({
        usermail: "john@example.com",
        password: "password123",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/api/cpsh/users/login", {
        usermail: "john@example.com",
        password: "password123",
      });
      expect(localStorage.getItem("accessToken")).toBe("mock_jwt_token");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("register", () => {
    it("should construct FormData and save token on success", async () => {
      const mockResponse = {
        data: {
          accessToken: "mock_jwt_token_reg",
          user: { id: "2", username: "jane" },
        },
      };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await userService.register({
        fullname: "Jane Doe",
        username: "janedoe",
        email: "jane@example.com",
        password: "secretpassword",
        verificationToken: "token_123",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/cpsh/users/register",
        expect.any(FormData),
        expect.objectContaining({
          headers: { "Content-Type": "multipart/form-data" },
        })
      );
      expect(localStorage.getItem("accessToken")).toBe("mock_jwt_token_reg");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("should call logout endpoint and remove accessToken from localStorage", async () => {
      localStorage.setItem("accessToken", "active_token");
      apiClient.post.mockResolvedValue({ message: "Logged out" });

      await userService.logout();

      expect(apiClient.post).toHaveBeenCalledWith("/api/cpsh/users/logout");
      expect(localStorage.getItem("accessToken")).toBeNull();
    });
  });

  describe("getProfile", () => {
    it("should call profile endpoint", async () => {
      apiClient.get.mockResolvedValue({ data: { user: { username: "john" } } });
      await userService.getProfile();
      expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/users/profile");
    });
  });

  describe("sendRegistrationOtp and verifyRegistrationOtp", () => {
    it("should send registration OTP", async () => {
      apiClient.post.mockResolvedValue({ success: true });
      await userService.sendRegistrationOtp("test@example.com");
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/cpsh/users/register/send-otp",
        { email: "test@example.com" }
      );
    });

    it("should verify registration OTP", async () => {
      apiClient.post.mockResolvedValue({ data: { verificationToken: "token_abc" } });
      const res = await userService.verifyRegistrationOtp("test@example.com", "123456");
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/cpsh/users/register/verify-otp",
        { email: "test@example.com", otp: "123456" }
      );
      expect(res.data.verificationToken).toBe("token_abc");
    });
  });
});
