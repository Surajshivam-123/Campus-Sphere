import apiClient from "./api.service";

/**
 * AI / RAG Service for Campus Sphere
 */
class AiService {
  /**
   * Send chat query to the RAG assistant
   * @param {string} message - Current user message
   * @param {Array<{role: string, content: string}>} history - Previous turns
   * @returns {Promise<{ answer: string, references: Array, suggestions: Array, isGuest: boolean, userStats: object|null }>}
   */
  async chat(message, history = []) {
    try {
      const response = await apiClient.post("/api/cpsh/ai/chat", {
        message: message.trim(),
        history,
      });
      // apiClient response interceptor unwraps to ApiResponse: { statusCode, data, message, success }
      return response?.data || response;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate AI response. Please try again.";
      throw new Error(errMsg);
    }
  }

  /**
   * Fetch context-aware quick suggestions
   */
  async getSuggestions() {
    try {
      const response = await apiClient.get("/api/cpsh/ai/suggestions");
      return response?.data || response;
    } catch {
      return {
        suggestions: [
          "How do I create an event on Campus Sphere?",
          "What is the difference between participant code and member code?",
          "How does the Cricket scoring platform work?",
          "How do coding contests work with Judge0?",
        ],
        isGuest: true,
      };
    }
  }

  /**
   * Fetch authenticated user's private summary metrics
   */
  async getMySummary() {
    try {
      const response = await apiClient.get("/api/cpsh/ai/my-summary");
      return response?.data || response;
    } catch {
      return null;
    }
  }
}

export default new AiService();
