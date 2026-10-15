import { describe, it, expect, vi, beforeEach } from "vitest";
import { AiGenerationService } from "../../src/services/ai/aiGeneration.service.js";
import ApiError from "../../src/utils/ApiError.js";

describe("AiGenerationService (Backend)", () => {
  let mockStorage;
  let aiService;

  beforeEach(() => {
    mockStorage = {
      uploadFile: vi.fn().mockResolvedValue({ url: "https://cloud.com/asset.svg" }),
    };
    aiService = new AiGenerationService("mock_gemini_key", mockStorage);
  });

  it("should throw ApiError if prompt is empty", async () => {
    await expect(aiService.generateAvatar("")).rejects.toThrow(ApiError);
    await expect(aiService.generateEventPoster("   ")).rejects.toThrow(ApiError);
  });

  it("should generate avatar and upload to storage", async () => {
    const mockSvg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50"/></svg>';
    vi.spyOn(aiService, "generateSvgFromGemini").mockResolvedValue(mockSvg);

    const url = await aiService.generateAvatar("cool robot portrait");

    expect(aiService.generateSvgFromGemini).toHaveBeenCalled();
    expect(mockStorage.uploadFile).toHaveBeenCalled();
    expect(url).toBe("https://cloud.com/asset.svg");
  });

  it("should generate poster and upload to storage", async () => {
    const mockSvg = '<svg viewBox="0 0 800 500"><rect width="800" height="500"/></svg>';
    vi.spyOn(aiService, "generateSvgFromGemini").mockResolvedValue(mockSvg);

    const url = await aiService.generateEventPoster("hackathon neon banner");

    expect(aiService.generateSvgFromGemini).toHaveBeenCalled();
    expect(mockStorage.uploadFile).toHaveBeenCalled();
    expect(url).toBe("https://cloud.com/asset.svg");
  });
});
