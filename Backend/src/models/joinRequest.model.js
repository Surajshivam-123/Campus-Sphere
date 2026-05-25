import mongoose, { Schema } from "mongoose";

/**
 * Unified join request model.
 *
 * type: "member"  — user requesting to join an event as a member (approved by organizer)
 * type: "team"    — player requesting to join a cricket team (approved by captain)
 * type: "club"    — user requesting to join a campus club (approved by founder/head)
 *
 * `team` is required when type === "team".
 * `club` is required when type === "club".
 * `event` is optional for club join requests.
 */
const joinRequestSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["member", "team", "club"],
      required: true,
    },
    event: { type: Schema.Types.ObjectId, ref: "Event", default: null },
    team: { type: Schema.Types.ObjectId, ref: "Team", default: null },
    club: { type: Schema.Types.ObjectId, ref: "Club", default: null },
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
// One request per user per club (club type only)
joinRequestSchema.index(
  { requester: 1, club: 1 },
  { unique: true, partialFilterExpression: { type: "club", club: { $type: "objectId" } } }
);
joinRequestSchema.index({ club: 1, type: 1, status: 1 });

joinRequestSchema.pre("validate", function (next) {
  if (this.type === "team" && !this.team) {
    return next(new Error("team is required for join requests of type 'team'"));
  }
  if (this.type === "club" && !this.club) {
    return next(new Error("club is required for join requests of type 'club'"));
  }
  next();
});

export const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);
