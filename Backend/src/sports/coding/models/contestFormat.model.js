import mongoose, { Schema } from "mongoose";

const contestFormatSchema = new Schema(
  {
    event:           { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    durationMinutes: { type: Number, required: true, min: 1 },   // contest window
    startTime:       { type: Date, required: true },
    endTime:         { type: Date },                              // computed on save
    scoringType:     { type: String, enum: ["points", "time_penalty"], default: "points" },
    // points: sum of problem points for accepted solutions
    // time_penalty: ICPC-style (penalty minutes for wrong attempts)
    allowedLanguages:{ type: [String], default: ["cpp", "python", "java", "javascript"] },
    maxAttempts:     { type: Number, default: 0 },  // 0 = unlimited
    showLeaderboard: { type: Boolean, default: true },
    createdBy:       { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-compute endTime before saving
contestFormatSchema.pre("save", function (next) {
  if (this.startTime && this.durationMinutes) {
    this.endTime = new Date(this.startTime.getTime() + this.durationMinutes * 60 * 1000);
  }
  next();
});

contestFormatSchema.index({ event: 1 });

export const ContestFormat = mongoose.model("ContestFormat", contestFormatSchema);
