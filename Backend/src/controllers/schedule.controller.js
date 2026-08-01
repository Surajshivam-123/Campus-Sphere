import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Schedule } from "../models/schedule.model.js";
import { CricketFormat } from "../sports/cricket/models/format.model.js";
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

// ── Auto schedule ────────────────────────────────────────────────────────────

const generateAutoSchedule = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const [format, teams] = await Promise.all([
      CricketFormat.findOne({ event: eventId }),
      Team.find({ event: eventId }).select("name").lean(),
    ]);

    if (!format) throw new ApiError(400, "Create a cricket format first");
    if (teams.length < 2) throw new ApiError(400, "At least 2 teams are required");

    const teamNames = teams.map((t) => t.name);
    const shuffled = shuffleArray(teamNames);

    let matches = [];
    if (format.tournamentType === "Knockout") {
      matches = buildKnockoutMatches(shuffled);
    } else if (format.tournamentType === "Double Elimination") {
      matches = buildDoubleEliminationMatches(shuffled);
    } else {
      matches = buildRoundRobinMatches(shuffled);
    }

    const schedule = await Schedule.findOneAndUpdate(
      { event: eventId },
      { event: eventId, createdBy: req.user._id, method: "Manual", matches },
      { upsert: true, new: true }
    );

    res.status(200).json(new ApiResponse(200, schedule, "Auto schedule generated successfully"));
    await cacheDel(`schedule:event:${eventId}`);
  } catch (error) {
    console.log("Error generating auto schedule", error);
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

export { generateAutoSchedule, saveManualSchedule, getSchedule };
