import { Schema } from "mongoose";
import mongoose from "mongoose";

const memberSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      trim: true,
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
