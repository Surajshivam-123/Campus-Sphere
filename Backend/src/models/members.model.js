import { Schema } from "mongoose";
import mongoose from "mongoose";

const memberSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    }
  },
  {
    timestamps: true,
  }
);

export const Member = mongoose.model("Member", memberSchema);
