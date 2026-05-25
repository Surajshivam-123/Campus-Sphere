import mongoose, { Schema } from "mongoose";

const clubMessageSchema = new Schema(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
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
    // soft-delete: message replaced with "This message was deleted"
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

clubMessageSchema.index({ club: 1, createdAt: -1 });
clubMessageSchema.index({ sender: 1 });

export const ClubMessage = mongoose.model("ClubMessage", clubMessageSchema);
