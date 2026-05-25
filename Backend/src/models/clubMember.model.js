import mongoose, { Schema } from "mongoose";

const clubMemberSchema = new Schema(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    position: {
      type: String,
      default: "Member",
      trim: true,
    },
    isHead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "alumni"],
      default: "active",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One membership per user per club
clubMemberSchema.index({ club: 1, user: 1 }, { unique: true });
clubMemberSchema.index({ club: 1, status: 1 });
clubMemberSchema.index({ user: 1 });

export const ClubMember = mongoose.model("ClubMember", clubMemberSchema);
