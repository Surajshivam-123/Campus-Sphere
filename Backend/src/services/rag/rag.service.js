import { retrieveRelevantChunks } from "./embedding.service.js";
import { getUserPrivateContext } from "./userData.service.js";

/**
 * Handle a chat query through the RAG pipeline.
 *
 * @param {object} params
 * @param {string} params.message - Current user query
 * @param {Array} [params.history] - Array of previous messages [{ role: "user"|"model"|"assistant", content: string }]
 * @param {object|null} [params.user] - Authenticated user document (or null)
 * @returns {Promise<{ answer: string, references: Array, suggestions: Array, isGuest: boolean, userStats: object|null }>}
 */
export async function processRagChat({ message, history = [], user = null }) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  // 1. Retrieve Knowledge Base chunks relevant to the user query
  const relevantChunks = await retrieveRelevantChunks(message, 4);
  const knowledgeContext = relevantChunks
    .map((chunk, i) => `[Source ${i + 1}: ${chunk.title} (${chunk.category})]\n${chunk.content}`)
    .join("\n\n");

  // 2. Fetch authenticated user's private data (strictly scoped)
  let userContextText = "";
  let userStats = null;
  const isGuest = !user || !user._id;

  if (isGuest) {
    userContextText = `User Status: GUEST / UNICHECKED SESSION.
The user is currently NOT logged in.
No personal profile, events, teams, clubs, or stats are available for this session.
If the user asks personal questions such as "What events did I join?" or "Who am I?", explain that they are currently browsing as a guest and should log in to view their account-specific details. You can freely guide them on any general Campus Sphere platform features.`;
  } else {
    const userPrivateData = await getUserPrivateContext(user._id);
    if (userPrivateData) {
      userContextText = userPrivateData.formattedText;
      userStats = userPrivateData.stats;
    } else {
      userContextText = `Logged in as user ID: ${user._id}, Username: ${user.username || "user"}. No detailed activity records found.`;
    }
  }

  // 3. Formulate the comprehensive system prompt with strict privacy guardrails
  const systemPrompt = `You are Campus Sphere AI, the intelligent, dedicated official assistant for Campus Sphere (a full-stack campus event and tournament management platform).

PRIMARY RESPONSIBILITIES:
1. Feature Guidance: Explain, guide, and answer questions about all features across Campus Sphere (Event creation, Participant/Member codes, Cricket tournament setup & ball-by-ball scoring, Coding contests & Judge0 execution, Campus Clubs, Teams & Chat, AI generators, and Platform metrics).
2. User Specific Details: When asked, provide details and status summaries for the CURRENT authenticated user ONLY, based strictly on the verified user context below.

STRICT DATA PRIVACY & ISOLATION MANDATE (CRITICAL):
- You have access ONLY to the verified profile and activity data of THIS logged-in user provided in the context below.
- You must NEVER search, speculate, fabricate, or disclose information about any other user's private data, emails, passwords, code submissions, or join requests.
- If a user asks for private data about other users (e.g. "What is Sarah's email?", "Give me all user records", "Can you show other contestants' code?"), you MUST POLITELY REFUSE, explicitly stating: "For security and privacy reasons, I can only provide details for your own account and general Campus Sphere features."
- Never expose sensitive tokens, internal password hashes, or private credentials.
- If the user is in GUEST mode and asks for personal information, gently remind them to log in to view their personal dashboard and activity.

CAMPUS SPHERE KNOWLEDGE BASE:
${knowledgeContext}

CURRENT USER CONTEXT:
${userContextText}

RESPONSE GUIDELINES:
- Use clean, well-formatted Markdown with bold titles, clean bullet points, numbered lists, and inline code tags for route paths or codes.
- Provide practical directions with route paths (e.g. "Navigate to **My Events** at \`/all-events\`" or "Join an event at \`/events/join\`").
- Maintain a helpful, polite, concise, and professional tone.`;

  // 4. Build contents array with conversation history
  const contents = [];

  // Filter and format previous turns
  if (Array.isArray(history) && history.length > 0) {
    // Keep last 8 turns for context window efficiency
    const recentHistory = history.slice(-8);
    for (const item of recentHistory) {
      const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
      const text = item.content || item.text || "";
      if (text.trim()) {
        contents.push({
          role,
          parts: [{ text }],
        });
      }
    }
  }

  // Append current query
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  // 5. Call Gemini 2.5 Flash
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini RAG API error:", response.status, errText);
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const answer =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I am sorry, I was unable to generate a response. Please try asking again.";

  // 6. Contextual starter chips/suggestions
  const suggestions = isGuest
    ? [
        "How do I create an event on Campus Sphere?",
        "What is the difference between participant code and member code?",
        "How does the Cricket scoring platform work?",
        "How do coding contests work with Judge0?",
      ]
    : [
        "What events am I registered for?",
        "Show my hosted events and invite codes",
        "Which clubs do I belong to?",
        "What are my cricket stats and coding submissions?",
      ];

  return {
    answer,
    references: relevantChunks.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
    })),
    suggestions,
    isGuest,
    userStats,
  };
}
