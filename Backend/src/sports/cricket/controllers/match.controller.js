import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { Match } from "../../../models/match.model.js";
import { Team } from "../../../models/team.model.js";
import { Schedule } from "../../../models/schedule.model.js";
import { CricketFormat } from "../models/format.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../../utils/redis.js";
import { emitMatchUpdate } from "../../../socket.js";

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

    const battingFirst =
      tossDecision === "bat" ? tossWinner : (tossWinner === match.team1 ? match.team2 : match.team1);

    match.tossWinner = tossWinner;
    match.tossDecision = tossDecision;
    match.status = "toss_done"; // wait for squad selection
    match.currentInnings = 1;
    match.innings1.battingTeam = battingFirst;
    match.innings2.battingTeam = battingFirst === match.team1 ? match.team2 : match.team1;

    await match.save();
    await cacheDel(`match:${matchId}`, `matches:event:${match.event}`);
    emitMatchUpdate(match.toObject());
    res.status(200).json(new ApiResponse(200, match, "Toss recorded — awaiting squad selection"));
  } catch (error) {
    console.log("Error starting match", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error starting match"));
  }
});

// ── Captain submits their squad ───────────────────────────────────────────────
const submitSquad = asyncHandler(async (req, res) => {
  try {
    const { matchId } = req.params;
    const { teamName, players } = req.body;
    // players: [{ name, playerId }]

    const match = await Match.findById(matchId);
    if (!match) throw new ApiError(404, "Match not found");
    if (match.status !== "toss_done") throw new ApiError(400, "Toss must be done before squad submission");

    if (match.team1 === teamName) {
      match.team1Squad = players;
    } else if (match.team2 === teamName) {
      match.team2Squad = players;
    } else {
      throw new ApiError(400, "Team not part of this match");
    }

    // If both squads submitted, move to squads_ready
    if (match.team1Squad.length > 0 && match.team2Squad.length > 0) {
      match.status = "squads_ready";
    }

    await match.save();
    await cacheDel(`match:${matchId}`, `matches:event:${match.event}`);
    emitMatchUpdate(match.toObject());
    res.status(200).json(new ApiResponse(200, match, "Squad submitted"));
  } catch (error) {
    console.log("Error submitting squad", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error submitting squad"));
  }
});

// ── Scorer confirms playing XI from both squads ───────────────────────────────
const confirmPlayingXI = asyncHandler(async (req, res) => {
  try {
    const { matchId } = req.params;
    const { team1PlayingXI, team2PlayingXI } = req.body;
    // each: [{ name, playerId }]

    const match = await Match.findById(matchId);
    if (!match) throw new ApiError(404, "Match not found");
    if (match.status !== "squads_ready") throw new ApiError(400, "Squads must be ready before confirming XI");

    match.team1PlayingXI = team1PlayingXI;
    match.team2PlayingXI = team2PlayingXI;
    match.status = "live";

    await match.save();
    await cacheDel(`match:${matchId}`, `matches:event:${match.event}`);
    emitMatchUpdate(match.toObject());
    res.status(200).json(new ApiResponse(200, match, "Playing XI confirmed — match is live"));
  } catch (error) {
    console.log("Error confirming playing XI", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error confirming playing XI"));
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
      // Current on-field players sent from frontend
      striker = "",
      nonStriker = "",
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) throw new ApiError(404, "Match not found");
    if (match.status !== "live") throw new ApiError(400, "Match is not live");

    const inningsKey = match.currentInnings === 1 ? "innings1" : "innings2";
    const innings = match[inningsKey];

    const isLegal = !isWide && !isNoBall;

    // ── Persist current on-field players ──────────────────────────────────
    innings.currentStriker    = striker    || batsmanName;
    innings.currentNonStriker = nonStriker || "";
    innings.currentBowler     = bowlerName;

    // ── Update bowler stats ────────────────────────────────────────────────
    let bowler = innings.bowlers.find((b) => b.name === bowlerName);
    if (!bowler && bowlerName) {
      innings.bowlers.push({ name: bowlerName, overs: 0, balls: 0, runs: 0, wickets: 0 });
      bowler = innings.bowlers[innings.bowlers.length - 1];
    }

    // ── Update batsman stats ───────────────────────────────────────────────
    let batsman = innings.batsmen.find((b) => b.name === batsmanName && !b.isOut);
    if (!batsman && batsmanName) {
      innings.batsmen.push({ name: batsmanName, runs: 0, balls: 0, fours: 0, sixes: 0, isOnStrike: true });
      batsman = innings.batsmen[innings.batsmen.length - 1];
    }

    // Mark isOnStrike correctly
    innings.batsmen.forEach((b) => { b.isOnStrike = b.name === batsmanName && !b.isOut; });

    // ── Runs ───────────────────────────────────────────────────────────────
    if (!isBye && !isLegBye) {
      innings.runs += runs;
      if (batsman) {
        batsman.runs += runs;
        if (isLegal) batsman.balls += 1;   // wides don't count as balls faced
        if (runs === 4) batsman.fours += 1;
        if (runs === 6) batsman.sixes += 1;
      }
    } else {
      // Byes/leg-byes: count to team total and extras, not batsman
      innings.runs   += runs;
      innings.extras += runs;
      if (batsman && isLegal) batsman.balls += 1;
    }

    if (isWide || isNoBall) innings.extras += 1;

    // ── Wicket ─────────────────────────────────────────────────────────────
    if (isWicket) {
      innings.wickets += 1;
      if (batsman) batsman.isOut = true;
      if (bowler)  bowler.wickets += 1;
    }

    // ── Ball / over count (legal deliveries only) ──────────────────────────
    if (isLegal) {
      innings.balls += 1;
      if (bowler) bowler.balls += 1;

      if (innings.balls >= 6) {
        innings.overs += 1;
        innings.balls  = 0;
        if (bowler) { bowler.overs += 1; bowler.balls = 0; }

        // End of over: swap striker/non-striker
        const tmp = innings.currentStriker;
        innings.currentStriker    = innings.currentNonStriker;
        innings.currentNonStriker = tmp;
        // Bowler will be set by next delivery
        innings.currentBowler = "";
      } else if (!isWicket && runs % 2 !== 0) {
        // Odd runs on a legal ball: swap strike
        const tmp = innings.currentStriker;
        innings.currentStriker    = innings.currentNonStriker;
        innings.currentNonStriker = tmp;
      }
    }

    // ── Ball-by-ball log ───────────────────────────────────────────────────
    innings.ballByBall.push({
      over:  innings.overs,
      ball:  innings.balls,
      runs,
      batsmanName,
      bowlerName,
      isWicket,
      isWide,
      isNoBall,
      isBye,
      isLegBye,
      commentary: commentary ||
        `${bowlerName} to ${batsmanName}: ${
          isWicket ? "WICKET! " : ""
        }${isWide ? "Wide " : ""}${isNoBall ? "No Ball " : ""}${runs} run(s)`,
    });

    // ── Check innings / match end ──────────────────────────────────────────
    const inningsOver = innings.wickets >= 10 || innings.overs >= match.overs;

    if (inningsOver && match.currentInnings === 1) {
      match.currentInnings = 2;
    } else if (inningsOver && match.currentInnings === 2) {
      match.status = "completed";
      const i1 = match.innings1, i2 = match.innings2;
      if (i2.runs > i1.runs) {
        match.result = `${i2.battingTeam} won by ${10 - i2.wickets} wicket(s)`;
      } else if (i1.runs > i2.runs) {
        match.result = `${i1.battingTeam} won by ${i1.runs - i2.runs} run(s)`;
      } else {
        match.result = "Match tied";
      }
    }

    // ── Chase complete in 2nd innings ──────────────────────────────────────
    if (match.currentInnings === 2 && match.status === "live") {
      const target = match.innings1.runs + 1;
      if (match.innings2.runs >= target) {
        match.status = "completed";
        match.result = `${match.innings2.battingTeam} won by ${10 - match.innings2.wickets} wicket(s)`;
      }
    }

    // ── Emit & respond immediately — no waiting for DB ────────────────────
    const matchObj = match.toObject();
    emitMatchUpdate(matchObj);
    res.status(200).json(new ApiResponse(200, matchObj, "Delivery recorded"));

    // ── Persist to DB and invalidate cache in background ──────────────────
    match.save()
      .then(() => cacheDel(`match:${matchId}`, `matches:event:${match.event}`))
      .catch((err) => console.log("Background save error", err));
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

// ── Public: check if any match in an event is currently live ─────────────────
const getEventLiveStatus = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const liveMatch = await Match.findOne({ event: eventId, status: "live" }).select("_id").lean();
  res.status(200).json(new ApiResponse(200, { isLive: liveMatch }, "Live status fetched"));
});

export { initMatchesFromSchedule, getEventMatches, getMatch, startMatch, addDelivery, updateMatch, submitSquad, confirmPlayingXI, getEventLiveStatus };
