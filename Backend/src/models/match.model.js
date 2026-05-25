import mongoose, { Schema } from "mongoose";

const inningsSchema = new Schema({
  battingTeam: { type: String, default: "" },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  // Current players on field — persisted so scorer can resume after refresh
  currentStriker:    { type: String, default: "" },
  currentNonStriker: { type: String, default: "" },
  currentBowler:     { type: String, default: "" },
  batsmen: [
    {
      playerId: { type: Schema.Types.ObjectId, ref: "Cricket_Player" },
      name: { type: String, default: "" },
      runs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
      fours: { type: Number, default: 0 },
      sixes: { type: Number, default: 0 },
      isOut: { type: Boolean, default: false },
      isOnStrike: { type: Boolean, default: false },
    },
  ],
  bowlers: [
    {
      playerId: { type: Schema.Types.ObjectId, ref: "Cricket_Player" },
      name: { type: String, default: "" },
      overs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      maidens: { type: Number, default: 0 },
    },
  ],
  ballByBall: [
    {
      over: Number,
      ball: Number,
      runs: Number,
      batsmanName: { type: String, default: "" },
      bowlerName:  { type: String, default: "" },
      isWicket: { type: Boolean, default: false },
      isWide: { type: Boolean, default: false },
      isNoBall: { type: Boolean, default: false },
      isBye: { type: Boolean, default: false },
      isLegBye: { type: Boolean, default: false },
      commentary: { type: String, default: "" },
    },
  ],
});

const matchSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    team1Id: { type: Schema.Types.ObjectId, ref: "Team" },
    team2Id: { type: Schema.Types.ObjectId, ref: "Team" },
    venue: { type: String, default: "" },
    date: { type: String, default: "" },
    round: { type: String, default: "" },
    overs: { type: Number, default: 20 },
    status: {
      type: String,
      enum: ["upcoming", "toss_done", "squads_ready", "live", "completed", "abandoned"],
      default: "upcoming",
    },
    tossWinner: { type: String, default: "" },
    tossDecision: { type: String, enum: ["bat", "bowl", ""], default: "" },
    currentInnings: { type: Number, default: 1 },
    // Squad submitted by each captain (player names from their team)
    team1Squad: [{ name: { type: String }, playerId: { type: Schema.Types.ObjectId, ref: "Cricket_Player" } }],
    team2Squad: [{ name: { type: String }, playerId: { type: Schema.Types.ObjectId, ref: "Cricket_Player" } }],
    // Playing XI confirmed by scorer after seeing who's on the ground
    team1PlayingXI: [{ name: { type: String }, playerId: { type: Schema.Types.ObjectId, ref: "Cricket_Player" } }],
    team2PlayingXI: [{ name: { type: String }, playerId: { type: Schema.Types.ObjectId, ref: "Cricket_Player" } }],
    innings1: { type: inningsSchema, default: () => ({}) },
    innings2: { type: inningsSchema, default: () => ({}) },
    result: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

matchSchema.index({ event: 1 });
matchSchema.index({ status: 1 });

export const Match = mongoose.model("Match", matchSchema);
