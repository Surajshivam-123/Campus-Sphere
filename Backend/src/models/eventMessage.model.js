import mongoose, { Schema } from "mongoose";

const eventMessageSchema = new Schema(
  {
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

eventMessageSchema.index({ event: 1, createdAt: -1 });
eventMessageSchema.index({ sender: 1 });

export const EventMessage = mongoose.model("EventMessage", eventMessageSchema);
