import { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    name: {
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

export const Participant = mongoose.model("Participant", participantSchema);
