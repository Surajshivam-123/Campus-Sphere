import { JoinRequest } from "../models/joinRequest.model.js";
import { Member } from "../models/members.model.js";
import { Cricket_Player } from "../sports/cricket/models/player.model.js";
import { cacheDel } from "../utils/redis.js";
import { getIO } from "../socket.js";

/**
 * Submit a join request.
 * @param {"member"|"team"} type
 * @param {{ eventId, requesterId, requesterName, team?, captainId?, eventName? }} opts
 */
export async function submitJoinRequest(type, opts) {
  const { eventId, requesterId, requesterName, team, captainId, eventName } = opts;

  const filter =
    type === "member"
      ? { type, requester: requesterId, event: eventId }
      : { type, requester: requesterId, team: team._id };

  const existing = await JoinRequest.findOne(filter);
  if (existing) {
    return { conflict: true, status: existing.status };
  }

  const joinReq = await JoinRequest.create({
    type,
    event: eventId,
    requester: requesterId,
    team: team?._id ?? null,
  });
  console.log("[submitJoinRequest] created:", joinReq._id, "type:", type, "event:", eventId);

  const io = getIO();
  if (io) {
    if (type === "member") {
      io.to(`organizer:${opts.organizerId}`).emit("member:join:request", {
        requestId: joinReq._id,
        eventId,
        eventName,
        requesterName,
        requesterId,
      });
    } else {
      io.to(`captain:${captainId}`).emit("join:request", {
        requestId: joinReq._id,
        teamId: team._id,
        teamName: team.name,
        requesterName,
        eventId,
      });
    }
  }

  return { joinReq };
}

/**
 * Respond to a join request (approve / reject).
 * On approval, creates the Member or Cricket_Player record.
 * @param {string} requestId
 * @param {"approve"|"reject"} action
 * @param {string} responderId  — organizer (_id) for member, captain (_id) for team
 */
export async function respondToRequest(requestId, action, responderId) {
  const joinReq = await JoinRequest.findById(requestId)
    .populate("team")
    .populate("event", "organizer eventName");

  if (!joinReq) return { notFound: true };
  if (joinReq.status !== "pending") return { alreadyHandled: true, status: joinReq.status };

  // Authorization check
  if (joinReq.type === "member") {
    if (joinReq.event.organizer.toString() !== responderId.toString()) {
      return { forbidden: true };
    }
  } else {
    if (joinReq.team.owner.toString() !== responderId.toString()) {
      return { forbidden: true };
    }
  }

  joinReq.status = action === "approve" ? "approved" : "rejected";

  let created = null;
  if (action === "approve") {
    if (joinReq.type === "member") {
      const exists = await Member.findOne({ owner: joinReq.requester, event: joinReq.event._id });
      if (!exists) {
        // Fetch user to get their name
        const { User } = await import("../models/user.model.js");
        const user = await User.findById(joinReq.requester).select("fullname username").lean();
        created = await Member.create({
          owner: joinReq.requester,
          event: joinReq.event._id,
          name: user?.fullname || user?.username || "",
          role: "",
        });
      }
      await cacheDel(`members:event:${joinReq.event._id}`, `member:events:${joinReq.requester}`);
    } else {
      const exists = await Cricket_Player.findOne({ team: joinReq.team._id, owner: joinReq.requester });
      if (!exists) {
        created = await Cricket_Player.create({ team: joinReq.team._id, owner: joinReq.requester });
      }
      await cacheDel(
        `myteam:event:${joinReq.event._id}:user:${joinReq.requester}`,
        `team:event:${joinReq.event._id}:owner:${responderId}`,
        `teams:event:${joinReq.event._id}`
      );
    }
  }

  await joinReq.save();

  const io = getIO();
  if (io) {
    const eventName = joinReq.event?.eventName;
    if (joinReq.type === "member") {
      io.to(`user:${joinReq.requester.toString()}`).emit("member:join:response", {
        eventId: joinReq.event._id,
        eventName,
        status: joinReq.status,
      });
    } else {
      io.to(`user:${joinReq.requester.toString()}`).emit("join:response", {
        teamName: joinReq.team.name,
        status: joinReq.status,
        eventId: joinReq.event._id,
      });
    }
  }

  return { status: joinReq.status, created };
}

/**
 * Fetch pending requests.
 * For type "member" — filtered by eventId (organizer view).
 * For type "team"   — filtered by teamId (captain view).
 */
export async function getPendingRequests(type, { eventId, teamId }) {
  const filter = type === "member"
    ? { type, event: eventId, status: "pending" }
    : { type, team: teamId, status: "pending" };

  console.log("[getPendingRequests] filter:", JSON.stringify(filter));
  const results = await JoinRequest.find(filter)
    .populate("requester", "fullname username avatar")
    .sort({ createdAt: 1 })
    .lean();
  console.log("[getPendingRequests] found:", results.length);
  return results;
}
