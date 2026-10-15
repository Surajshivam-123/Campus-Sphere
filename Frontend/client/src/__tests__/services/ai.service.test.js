import { describe, it, expect, vi, beforeEach } from "vitest";
import aiService from "../../services/ai.service.js";
import apiClient from "../../services/api.service.js";

vi.mock("../../services/api.service.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("AiService (Frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("chat", () => {
    it("should call ai chat endpoint and return data", async () => {
      const mockResult = {
        answer: "Campus Sphere is an event management platform.",
        references: [],
      };
      apiClient.post.mockResolvedValue({ data: mockResult });

      const res = await aiService.chat("What is Campus Sphere?");

      expect(apiClient.post).toHaveBeenCalledWith("/api/cpsh/ai/chat", {
        message: "What is Campus Sphere?",
        history: [],
      });
      expect(res).toEqual(mockResult);
    });

    it("should throw formatted error when request fails", async () => {
      apiClient.post.mockRejectedValue({
        response: { data: { message: "Rate limit exceeded" } },
      });

      await expect(aiService.chat("Hello")).rejects.toThrow("Rate limit exceeded");
    });
  });

  describe("getSuggestions", () => {
    it("should return fetched suggestions if API succeeds", async () => {
      const suggestions = ["How to join?"];
      apiClient.get.mockResolvedValue({ data: { suggestions } });

      const res = await aiService.getSuggestions();
      expect(res.suggestions).toEqual(suggestions);
    });

    it("should return fallback default suggestions if API fails", async () => {
      apiClient.get.mockRejectedValue(new Error("Network Error"));

      const res = await aiService.getSuggestions();
      expect(res.suggestions.length).toBeGreaterThan(0);
      expect(res.isGuest).toBe(true);
    });
  });

  describe("getMySummary", () => {
    it("should return user summary data when API succeeds", async () => {
      const summary = { hostedEventsCount: 2 };
      apiClient.get.mockResolvedValue({ data: summary });

      const res = await aiService.getMySummary();
      expect(res).toEqual(summary);
    });

    it("should return null when API fails", async () => {
      apiClient.get.mockRejectedValue(new Error("401 Unauthorized"));

      const res = await aiService.getMySummary();
      expect(res).toBeNull();
    });
  });
});
