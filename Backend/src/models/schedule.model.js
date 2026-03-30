import mongoose, { Schema } from "mongoose";

const matchSchema = new Schema({
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  date: { type: String, default: "" },
  venue: { type: String, default: "" },
  round: { type: String, default: "" },
});

const scheduleSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    method: { type: String, enum: ["AI", "Manual"], required: true },
    matches: [matchSchema],
  },
  { timestamps: true }
);

export const Schedule = mongoose.model("Schedule", scheduleSchema);
