import mongoose, { Schema } from "mongoose";

const teamMessageSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

teamMessageSchema.index({ team: 1, createdAt: -1 });
teamMessageSchema.index({ sender: 1 });

export const TeamMessage = mongoose.model("TeamMessage", teamMessageSchema);
