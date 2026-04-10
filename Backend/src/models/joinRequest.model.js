import mongoose, { Schema } from "mongoose";

/**
 * Unified join request model.
 *
 * type: "member"  — user requesting to join an event as a member (approved by organizer)
 * type: "team"    — player requesting to join a cricket team (approved by captain)
 *
 * `team` is required when type === "team", omitted when type === "member".
 */
const joinRequestSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["member", "team"],
      required: true,
    },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One request per user per event (member type only)
joinRequestSchema.index(
  { requester: 1, event: 1 },
  { unique: true, partialFilterExpression: { type: "member" } }
);
// One request per user per team (team type only — team is never null here)
joinRequestSchema.index(
  { requester: 1, team: 1 },
  { unique: true, partialFilterExpression: { type: "team", team: { $type: "objectId" } } }
);
joinRequestSchema.index({ event: 1, type: 1, status: 1 });
joinRequestSchema.index({ team: 1, type: 1, status: 1 });

joinRequestSchema.pre("validate", function (next) {
  if (this.type === "team" && !this.team) {
    return next(new Error("team is required for join requests of type 'team'"));
  }
  next();
});

export const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);
