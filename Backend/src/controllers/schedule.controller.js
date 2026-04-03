import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Schedule } from "../models/schedule.model.js";
import { CricketFormat } from "../models/cricketFormat.model.js";
import { Team } from "../models/team.model.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";

const SCHEDULE_TTL = 300;

// ── helpers ──────────────────────────────────────────────────────────────────

const buildRoundRobinMatches = (teams) => {
  const matches = [];
  for (let i = 0; i < teams.length; i++)
    for (let j = i + 1; j < teams.length; j++)
      matches.push({ team1: teams[i], team2: teams[j], round: "League" });
  return matches;
};

const buildKnockoutMatches = (teams) => {
  const matches = [];
  for (let i = 0; i < teams.length - 1; i += 2)
    matches.push({ team1: teams[i], team2: teams[i + 1], round: "Round 1" });
  return matches;
};

const buildDoubleEliminationMatches = (teams) => {
  const matches = [];
  for (let i = 0; i < teams.length - 1; i += 2)
    matches.push({ team1: teams[i], team2: teams[i + 1], round: "Winners Bracket R1" });
  return matches;
};

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── AI schedule ──────────────────────────────────────────────────────────────

const generateAISchedule = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const [format, teams] = await Promise.all([
      CricketFormat.findOne({ event: eventId }),
      Team.find({ event: eventId }).select("name").lean(),
    ]);

    if (!format) throw new ApiError(400, "Create a cricket format first");
    if (teams.length < 2) throw new ApiError(400, "At least 2 teams are required");

    const teamNames = teams.map((t) => t.name);
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    let matches = [];
    let usedAI = false;

    if (GEMINI_KEY) {
      try {
        const prompt = `You are a cricket tournament scheduler. Generate a fair, unbiased match schedule.
Tournament details:
- Type: ${format.tournamentType}
- Teams: ${teamNames.join(", ")}
- Overs per match: ${format.overs}
- Players per team: ${format.playersPerTeam}

Return ONLY a valid JSON array (no markdown, no explanation) like:
[{"team1":"TeamA","team2":"TeamB","round":"Round 1"},...]
Make sure every team gets a fair chance. Randomize the order to avoid bias.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.error("Gemini API error:", geminiRes.status, errText);
          throw new Error(`Gemini API returned ${geminiRes.status}`);
        }

        const geminiData = await geminiRes.json();
        const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonStr = raw.replace(/```json|```/g, "").trim();

        if (!jsonStr) {
          console.error("Gemini returned empty content, falling back to local scheduler");
          throw new Error("empty_gemini_response");
        }

        try {
          matches = JSON.parse(jsonStr);
          usedAI = true;
        } catch (parseErr) {
          console.error("Failed to parse Gemini response:", jsonStr);
          throw new Error("invalid_gemini_json");
        }
      } catch (aiErr) {
        console.warn("Gemini failed, using local fallback:", aiErr.message);
      }
    }

    if (!usedAI) {
      const shuffled = shuffleArray(teamNames);
      if (format.tournamentType === "Knockout") matches = buildKnockoutMatches(shuffled);
      else if (format.tournamentType === "Double Elimination") matches = buildDoubleEliminationMatches(shuffled);
      else matches = buildRoundRobinMatches(shuffled);
    }

    const schedule = await Schedule.findOneAndUpdate(
      { event: eventId },
      { event: eventId, createdBy: req.user._id, method: "AI", matches },
      { upsert: true, new: true }
    );

    res.status(200).json(new ApiResponse(200, schedule, "AI schedule generated successfully"));
    await cacheDel(`schedule:event:${eventId}`);
  } catch (error) {
    console.log("Error generating AI schedule", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error generating schedule"));
  }
});

// ── Manual schedule ───────────────────────────────────────────────────────────

const saveManualSchedule = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { matches } = req.body;

    if (!matches || !Array.isArray(matches) || matches.length === 0)
      throw new ApiError(400, "Matches array is required");

    const schedule = await Schedule.findOneAndUpdate(
      { event: eventId },
      { event: eventId, createdBy: req.user._id, method: "Manual", matches },
      { upsert: true, new: true }
    );

    res.status(200).json(new ApiResponse(200, schedule, "Schedule saved successfully"));
    await cacheDel(`schedule:event:${eventId}`);
  } catch (error) {
    console.log("Error saving manual schedule", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error saving schedule"));
  }
});

// ── Get schedule ──────────────────────────────────────────────────────────────

const getSchedule = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `schedule:event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Schedule fetched"));
    }

    const schedule = await Schedule.findOne({ event: eventId });
    if (schedule) await cacheSet(cacheKey, schedule, SCHEDULE_TTL);
    res.status(200).json(new ApiResponse(200, schedule || null, "Schedule fetched"));
  } catch (error) {
    console.log("Error fetching schedule", error);
    res.status(500).json(new ApiResponse(500, null, "Error fetching schedule"));
  }
});

export { generateAISchedule, saveManualSchedule, getSchedule };
