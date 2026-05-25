import mongoose, { Schema } from "mongoose";

const contestSchema = new Schema(
  {
    event:       { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    duration:    { type: Number, default: 120 },        // minutes (total intended duration)
    scheduledStartTime: { type: Date },
    startTime:   { type: Date },
    endTime:     { type: Date },
    pausedAt:    { type: Date },                        // when it was paused
    totalPausedMs: { type: Number, default: 0 },        // cumulative paused milliseconds
    status:      { type: String, enum: ["draft", "live", "paused", "ended"], default: "draft" },
    allowedLanguages: {
      type: [String],
      default: ["cpp", "python", "java", "javascript"],
    },
    scoringMode: {
      type: String,
      enum: ["binary", "partial"],
      default: "binary",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

contestSchema.index({ event: 1 });

export const Contest = mongoose.model("Contest", contestSchema);
