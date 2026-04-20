import { JoinRequest } from "../models/joinRequest.model.js";
import { Member } from "../models/members.model.js";
import { Cricket_Player } from "../sports/cricket/models/player.model.js";
import { cacheDel } from "../utils/redis.js";
import { getIO } from "../socket.js";

/**
 * Submit a join request.
 * @param {"member"|"team"|"club"} type
 * @param {{ eventId?, requesterId, requesterName, team?, captainId?, eventName?, clubId?, founderId?, clubName? }} opts
 */
export async function submitJoinRequest(type, opts) {
  const { eventId, requesterId, requesterName, team, captainId, eventName, clubId, founderId, clubName } = opts;

  let filter;
  if (type === "member") {
    filter = { type, requester: requesterId, event: eventId };
  } else if (type === "team") {
    filter = { type, requester: requesterId, team: team._id };
  } else {
    filter = { type, requester: requesterId, club: clubId };
  }

  // Remove any existing request for this user+event/team/club before creating fresh
  const existing = await JoinRequest.findOne(filter);
  if (existing) {
    if (existing.status === "pending") {
      // Already waiting — don't create duplicate
      return { conflict: true, status: "pending" };
    }
    if (existing.status === "approved" && type === "member") {
      const memberExists = await Member.findOne({ owner: requesterId, event: eventId });
      if (memberExists) return { conflict: true, status: "approved" };
    }
    // rejected, or approved with no Member record (stale) — delete and re-create
    await JoinRequest.findByIdAndDelete(existing._id);
  }

  // Also nuke any type-less ghost records that could trigger the unique index
  if (type === "member") {
    await JoinRequest.deleteMany({ requester: requesterId, event: eventId, type: { $exists: false } });
    await JoinRequest.deleteMany({ requester: requesterId, event: eventId, type: null });
  }

  const joinReq = await JoinRequest.create({
    type,
    event: eventId ?? null,
    requester: requesterId,
    team: team?._id ?? null,
    club: clubId ?? null,
  });

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
    } else if (type === "team") {
      io.to(`captain:${captainId}`).emit("join:request", {
        requestId: joinReq._id,
        teamId: team._id,
        teamName: team.name,
        requesterName,
        eventId,
      });
    } else {
      io.to(`founder:${founderId}`).emit("club:join:request", {
        requestId: joinReq._id,
        clubId,
        clubName,
        requesterName,
        requesterId,
      });
    }
  }

  return { joinReq };
}

/**
 * Respond to a join request (approve / reject).
 * On approval, creates the Member, Cricket_Player, or ClubMember record.
 * @param {string} requestId
 * @param {"approve"|"reject"} action
 * @param {string} responderId  — organizer for member, captain for team, founder/head for club
 */
export async function respondToRequest(requestId, action, responderId) {
  const joinReq = await JoinRequest.findById(requestId)
    .populate("team")
    .populate("event", "organizer eventName")
    .populate("club", "founder name");

  if (!joinReq) return { notFound: true };
  if (joinReq.status !== "pending") return { alreadyHandled: true, status: joinReq.status };

  // Authorization check
  if (joinReq.type === "member") {
    if (joinReq.event.organizer.toString() !== responderId.toString()) {
      return { forbidden: true };
    }
  } else if (joinReq.type === "team") {
    const isCaptain = joinReq.team.owner.toString() === responderId.toString();
    if (!isCaptain) {
      // Also allow the event organizer
      const { Event } = await import("../models/event.model.js");
      const event = await Event.findById(joinReq.event).select("organizer").lean();
      const isOrganizer = event?.organizer?.toString() === responderId.toString();
      if (!isOrganizer) return { forbidden: true };
    }
  } else {
    // club — founder or any isHead member can respond
    const { ClubMember } = await import("../models/clubMember.model.js");
    const isFounder = joinReq.club.founder.toString() === responderId.toString();
    const isHead = await ClubMember.findOne({ club: joinReq.club._id, user: responderId, isHead: true });
    if (!isFounder && !isHead) {
      return { forbidden: true };
    }
  }

  joinReq.status = action === "approve" ? "approved" : "rejected";

  let created = null;
  if (action === "approve") {
    if (joinReq.type === "member") {
      const exists = await Member.findOne({ owner: joinReq.requester, event: joinReq.event._id });
      if (!exists) {
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
    } else if (joinReq.type === "team") {
      const exists = await Cricket_Player.findOne({ team: joinReq.team._id, owner: joinReq.requester });
      if (!exists) {
        created = await Cricket_Player.create({ team: joinReq.team._id, owner: joinReq.requester });
      }
      await cacheDel(
        `myteam:event:${joinReq.event._id}:user:${joinReq.requester}`,
        `team:event:${joinReq.event._id}:owner:${responderId}`,
        `teams:event:${joinReq.event._id}`
      );
    } else {
      const { ClubMember } = await import("../models/clubMember.model.js");
      const exists = await ClubMember.findOne({ club: joinReq.club._id, user: joinReq.requester });
      if (!exists) {
        created = await ClubMember.create({
          club: joinReq.club._id,
          user: joinReq.requester,
          position: "Member",
          isHead: false,
          status: "active",
        });
      }
      await cacheDel(`club:members:${joinReq.club._id}`, `clubs:user:${joinReq.requester}`);
    }
  }

  await joinReq.save();

  const io = getIO();
  if (io) {
    if (joinReq.type === "member") {
      const eventName = joinReq.event?.eventName;
      io.to(`user:${joinReq.requester.toString()}`).emit("member:join:response", {
        eventId: joinReq.event._id,
        eventName,
        status: joinReq.status,
      });
    } else if (joinReq.type === "team") {
      io.to(`user:${joinReq.requester.toString()}`).emit("join:response", {
        teamName: joinReq.team.name,
        status: joinReq.status,
        eventId: joinReq.event._id,
      });
    } else {
      io.to(`user:${joinReq.requester.toString()}`).emit("club:join:response", {
        clubId: joinReq.club._id,
        clubName: joinReq.club.name,
        status: joinReq.status,
      });
    }
  }

  return { status: joinReq.status, created };
}

/**
 * Fetch pending requests.
 * For type "member" — filtered by eventId (organizer view).
 * For type "team"   — filtered by teamId (captain view).
 * For type "club"   — filtered by clubId (founder/head view).
 */
export async function getPendingRequests(type, { eventId, teamId, clubId }) {
  let filter;
  if (type === "member") {
    filter = { type, event: eventId, status: "pending" };
  } else if (type === "team") {
    filter = { type, team: teamId, status: "pending" };
  } else {
    filter = { type, club: clubId, status: "pending" };
  }

  const results = await JoinRequest.find(filter)
    .populate("requester", "fullname username avatar")
    .sort({ createdAt: 1 })
    .lean();
  return results;
}
