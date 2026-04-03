import mongoose from "mongoose";
import { Schema } from "mongoose";
const participantSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    event:{
        type:Schema.Types.ObjectId,
        ref:'Event'
    },
    identityNumber: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Compound index covers: find({owner}), find({event}), findOne({owner, event})
participantSchema.index({ owner: 1, event: 1 });
participantSchema.index({ identityNumber: 1 });

export const Participant = mongoose.model("Participant", participantSchema);
