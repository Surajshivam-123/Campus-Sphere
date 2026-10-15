import fs from "fs";
import path from "path";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";
import { storageService } from "../storage/storage.service.js";

/**
 * AiGenerationService - Handles AI visual generation (avatars, posters)
 * Adheres to:
 * - Single Responsibility Principle (SRP): Isolate AI API integration and SVG parsing from HTTP controllers.
 * - Dependency Inversion Principle (DIP): Uses storageService abstraction for saving assets.
 */
export class AiGenerationService {
  constructor(apiKey = process.env.GEMINI_API_KEY, storage = storageService) {
    this.apiKey = apiKey;
    this.storage = storage;
  }

  async generateSvgFromGemini(systemPrompt, prompt) {
    const key = this.apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Gemini API key is not configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    let rawSvg = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up markdown block wrapping if present
    rawSvg = rawSvg.replace(/```xml|```svg|```/gi, "").trim();

    if (!rawSvg.startsWith("<svg") && rawSvg.includes("<svg")) {
      rawSvg = rawSvg.substring(rawSvg.indexOf("<svg"));
    }
    if (rawSvg.includes("</svg>")) {
      rawSvg = rawSvg.substring(0, rawSvg.indexOf("</svg>") + 6);
    }

    if (!rawSvg || !rawSvg.startsWith("<svg")) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to generate a valid SVG");
    }

    return rawSvg;
  }

  async saveAndUploadSvg(svgContent, filePrefix) {
    const tempDir = path.resolve("./public/temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `${filePrefix}-${Date.now()}.svg`);
    fs.writeFileSync(tempFilePath, svgContent);

    const uploadResult = await this.storage.uploadFile(tempFilePath);
    if (!uploadResult?.url) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to upload generated asset");
    }

    return uploadResult.url;
  }

  async generateAvatar(prompt) {
    if (!prompt?.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Prompt is required");
    }

    const systemPrompt = `You are a professional SVG designer. Generate a beautiful, modern, clean, colorful vector avatar SVG based on the user's description.
Requirements:
- Return ONLY valid raw SVG XML code starting with '<svg' and ending with '</svg>'.
- Do not include markdown code block styling (such as \`\`\`xml or \`\`\`svg).
- Ensure it is a complete, self-contained SVG with standard namespaces (xmlns="http://www.w3.org/2000/svg"), viewBox="0 0 100 100", width, and height.
- Design a stunning, stylized vector portrait/graphic matching the prompt: "${prompt}".
- Do not include any text explanation or extra whitespace before or after the SVG tag.`;

    const svg = await this.generateSvgFromGemini(systemPrompt, prompt);
    return this.saveAndUploadSvg(svg, "avatar");
  }

  async generateEventPoster(prompt) {
    if (!prompt?.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Prompt is required");
    }

    const systemPrompt = `You are a professional SVG designer. Generate a stunning, beautiful, modern, and high-impact poster/banner SVG graphic for a campus event/festival based on the user's description.
Requirements:
- Return ONLY valid raw SVG XML code starting with '<svg' and ending with '</svg>'.
- Do not include markdown code block styling (such as \`\`\`xml or \`\`\`svg).
- Ensure it is a complete, self-contained SVG with standard namespaces (xmlns="http://www.w3.org/2000/svg"), viewBox="0 0 800 500" (landscape/banner aspect ratio), width, and height.
- Design a stunning, stylized vector banner matching the prompt: "${prompt}".
- Do not include any text explanation or extra whitespace before or after the SVG tag.`;

    const svg = await this.generateSvgFromGemini(systemPrompt, prompt);
    return this.saveAndUploadSvg(svg, "eventposter");
  }
}

export const aiGenerationService = new AiGenerationService();
