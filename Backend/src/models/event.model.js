import mongoose, { Schema } from "mongoose";
const eventSchema = new Schema(
  {
    festivalName: {
      type: String,
      trim: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    Mode: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    sports: {
      type: String,
      required: true,
      trim: true,
    },
    others: {
      type: String,
      required: true,
      trim: true,
    },
    cultural: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      default: 0,
    },
    rules: {
      type: Array,
      default: [],
    },
    poster: {
      type: String,
      required: true,
    },
    memberCode: {
      type: String,
      required: true,
      unique: true,
    },
    participantCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model("Event", eventSchema);
