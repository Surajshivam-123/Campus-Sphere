import mongoose, { Schema } from "mongoose";

const cricketFormatSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true,
    },
    tournamentType: {
      type: String,
      enum: ["Knockout", "League", "Round Robin", "Double Elimination"],
      required: true,
    },
    overs: {
      type: Number,
      required: true,
      min: 1,
    },
    playersPerTeam: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// event already has unique:true which creates an index
cricketFormatSchema.index({ createdBy: 1 });

export const CricketFormat = mongoose.model("CricketFormat", cricketFormatSchema);
