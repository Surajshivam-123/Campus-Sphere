import mongoose, { Schema } from "mongoose";

// Contest settings tied to a coding event
const contestSchema = new Schema(
  {
    event:       { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    duration:    { type: Number, default: 120 },   // minutes
    startTime:   { type: Date },
    endTime:     { type: Date },
    status:      { type: String, enum: ["draft", "live", "ended"], default: "draft" },
    allowedLanguages: {
      type: [String],
      default: ["cpp", "python", "java", "javascript"],
    },
    scoringMode: {
      type: String,
      enum: ["binary", "partial"],  // binary = full points or 0; partial = proportional to test cases passed
      default: "binary",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

contestSchema.index({ event: 1 });

export const Contest = mongoose.model("Contest", contestSchema);
