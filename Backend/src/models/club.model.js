import mongoose, { Schema } from "mongoose";

const clubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["technical", "cultural", "sports", "social", "other"],
      default: "other",
    },
    founder: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clubCode: {
      type: String,
      required: true,
      unique: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

clubSchema.index({ founder: 1 });
clubSchema.index({ college: 1 });
// clubCode already indexed via unique: true

export const Club = mongoose.model("Club", clubSchema);
