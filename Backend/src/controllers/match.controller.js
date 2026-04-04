import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Match } from "../models/match.model.js";
import { Team } from "../models/team.model.js";
import { Schedule } from "../models/schedule.model.js";
import { CricketFormat } from "../models/cricketFormat.model.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";
import { emitMatchUpdate } from "../socket.js";

const MATCH_TTL = 10; // short TTL for live scores

// ── Create matches from schedule ─────────────────────────────────────────────
const initMatchesFromSchedule = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const [schedule, format, teams] = await Promise.all([
      Schedule.findOne({ event: eventId }),
      CricketFormat.findOne({ event: eventId }),
      Team.find({ event: eventId }).lean(),
    ]);

    if (!schedule) throw new ApiError(400, "No schedule found for this event");

    // Build teamName -> teamId map
    const teamMap = {};
    teams.forEach((t) => { teamMap[t.name.toLowerCase()] = t._id; });

    const matchDocs = schedule.matches.map((m) => ({
      event: eventId,
      team1: m.team1,
      team2: m.team2,
      team1Id: teamMap[m.team1?.toLowerCase()],
      team2Id: teamMap[m.team2?.toLowerCase()],
      venue: m.venue || "",
      date: m.date || "",
      round: m.round || "",
      overs: format?.overs || 20,
      createdBy: req.user._id,
    }));

    // Remove old matches for this event then insert fresh
    await Match.deleteMany({ event: eventId });
    const matches = await Match.insertMany(matchDocs);

    await cacheDel(`matches:event:${eventId}`);
    res.status(201).json(new ApiResponse(201, matches, "Matches initialised successfully"));
  } catch (error) {
    console.log("Error initialising matches", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error initialising matches"));
  }
});

// ── Get all matches for an event ─────────────────────────────────────────────
const getEventMatches = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `matches:event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "Matches fetched"));

    const matches = await Match.find({ event: eventId }).lean();
    await cacheSet(cacheKey, matches, MATCH_TTL);
    res.status(200).json(new ApiResponse(200, matches, "Matches fetched"));
  } catch (error) {
    console.log("Error fetching matches", error);
    res.status(500).json(new ApiResponse(500, null, "Error fetching matches"));
  }
});

// ── Get single match ──────────────────────────────────────────────────────────
const getMatch = asyncHandler(async (req, res) => {
  try {
    const { matchId } = req.params;
    const cacheKey = `match:${matchId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "Match fetched"));

    const match = await Match.findById(matchId).lean();
    if (!match) throw new ApiError(404, "Match not found");

    await cacheSet(cacheKey, match, MATCH_TTL);
    res.status(200).json(new ApiResponse(200, match, "Match fetched"));
  } catch (error) {
    console.log("Error fetching match", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error fetching match"));
  }
});

// ── Start match / set toss ────────────────────────────────────────────────────
const startMatch = asyncHandler(async (req, res) => {
  try {
    const { matchId } = req.params;
    const { tossWinner, tossDecision } = req.body;

    const match = await Match.findById(matchId);
    if (!match) throw new ApiError(404, "Match not found");

    // Determine batting/bowling order
    const battingFirst =
      tossDecision === "bat" ? tossWinner : (tossWinner === match.team1 ? match.team2 : match.team1);

    match.tossWinner = tossWinner;
    match.tossDecision = tossDecision;
    match.status = "live";
    match.currentInnings = 1;
    match.innings1.battingTeam = battingFirst;
    match.innings2.battingTeam = battingFirst === match.team1 ? match.team2 : match.team1;

    await match.save();
    await cacheDel(`match:${matchId}`, `matches:event:${match.event}`);
    emitMatchUpdate(match.toObject());
    res.status(200).json(new ApiResponse(200, match, "Match started"));
  } catch (error) {
    console.log("Error starting match", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error starting match"));
  }
});

// ── Add a delivery (ball-by-ball input) ──────────────────────────────────────
const addDelivery = asyncHandler(async (req, res) => {
  try {
    const { matchId } = req.params;
    const {
      runs = 0,
      isWicket = false,
      isWide = false,
      isNoBall = false,
      isBye = false,
      isLegBye = false,
      batsmanName = "",
      bowlerName = "",
      commentary = "",
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) throw new ApiError(404, "Match not found");
    if (match.status !== "live") throw new ApiError(400, "Match is not live");

    const inningsKey = match.currentInnings === 1 ? "innings1" : "innings2";
    const innings = match[inningsKey];

    // ── Update bowler ──────────────────────────────────────────────────────
    let bowler = innings.bowlers.find((b) => b.name === bowlerName);
    if (!bowler && bowlerName) {
      innings.bowlers.push({ name: bowlerName, overs: 0, balls: 0, runs: 0, wickets: 0 });
      bowler = innings.bowlers[innings.bowlers.length - 1];
    }

    // ── Update batsman ─────────────────────────────────────────────────────
    let batsman = innings.batsmen.find((b) => b.name === batsmanName && !b.isOut);
    if (!batsman && batsmanName) {
      innings.batsmen.push({ name: batsmanName, runs: 0, balls: 0, fours: 0, sixes: 0, isOnStrike: true });
      batsman = innings.batsmen[innings.batsmen.length - 1];
    }

    const isLegal = !isWide && !isNoBall;

    // ── Runs ───────────────────────────────────────────────────────────────
    if (!isBye && !isLegBye) {
      innings.runs += runs;
      if (batsman) {
        batsman.runs += runs;
        if (!isWide) batsman.balls += 1;
        if (runs === 4) batsman.fours += 1;
        if (runs === 6) batsman.sixes += 1;
      }
    } else {
      innings.runs += runs;
      innings.extras += runs;
    }

    if (isWide || isNoBall) innings.extras += 1;

    // ── Wicket ─────────────────────────────────────────────────────────────
    if (isWicket) {
      innings.wickets += 1;
      if (batsman) batsman.isOut = true;
      if (bowler) bowler.wickets += 1;
    }

    // ── Ball count ─────────────────────────────────────────────────────────
    if (isLegal) {
      innings.balls += 1;
      if (bowler) bowler.balls += 1;
      if (innings.balls % 6 === 0) {
        innings.overs += 1;
        innings.balls = 0;
        if (bowler) { bowler.overs += 1; bowler.balls = 0; }
      }
    }

    // ── Ball-by-ball log ───────────────────────────────────────────────────
    innings.ballByBall.push({
      over: innings.overs,
      ball: innings.balls,
      runs,
      isWicket,
      isWide,
      isNoBall,
      isBye,
      isLegBye,
      commentary: commentary || `${bowlerName} to ${batsmanName}: ${runs} run(s)${isWicket ? " WICKET!" : ""}`,
    });

    // ── Check innings/match end ────────────────────────────────────────────
    const maxOvers = match.overs;
    const inningsOver =
      innings.wickets >= 10 || innings.overs >= maxOvers;

    if (inningsOver && match.currentInnings === 1) {
      match.currentInnings = 2;
    } else if (inningsOver && match.currentInnings === 2) {
      match.status = "completed";
      const i1 = match.innings1;
      const i2 = match.innings2;
      if (i2.runs > i1.runs) {
        const wktsLeft = 10 - i2.wickets;
        match.result = `${i2.battingTeam} won by ${wktsLeft} wicket(s)`;
      } else if (i1.runs > i2.runs) {
        match.result = `${i1.battingTeam} won by ${i1.runs - i2.runs} run(s)`;
      } else {
        match.result = "Match tied";
      }
    }

    // ── Check target in 2nd innings ────────────────────────────────────────
    if (match.currentInnings === 2 && match.status === "live") {
      const target = match.innings1.runs + 1;
      if (match.innings2.runs >= target) {
        match.status = "completed";
        const wktsLeft = 10 - match.innings2.wickets;
        match.result = `${match.innings2.battingTeam} won by ${wktsLeft} wicket(s)`;
      }
    }

    await match.save();
    await cacheDel(`match:${matchId}`, `matches:event:${match.event}`);
    emitMatchUpdate(match.toObject());
    res.status(200).json(new ApiResponse(200, match, "Delivery recorded"));
  } catch (error) {
    console.log("Error adding delivery", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error adding delivery"));
  }
});

// ── Update match meta (venue, date, result override) ─────────────────────────
const updateMatch = asyncHandler(async (req, res) => {
  try {
    const { matchId } = req.params;
    const { venue, date, status, result } = req.body;

    const match = await Match.findById(matchId);
    if (!match) throw new ApiError(404, "Match not found");

    if (venue !== undefined) match.venue = venue;
    if (date !== undefined) match.date = date;
    if (status !== undefined) match.status = status;
    if (result !== undefined) match.result = result;

    await match.save();
    await cacheDel(`match:${matchId}`, `matches:event:${match.event}`);
    emitMatchUpdate(match.toObject());
    res.status(200).json(new ApiResponse(200, match, "Match updated"));
  } catch (error) {
    console.log("Error updating match", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error updating match"));
  }
});

export { initMatchesFromSchedule, getEventMatches, getMatch, startMatch, addDelivery, updateMatch };
