import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Club } from "../models/club.model.js";
import { ClubMember } from "../models/clubMember.model.js";
import { JoinRequest } from "../models/joinRequest.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";
import { submitJoinRequest, respondToRequest, getPendingRequests } from "../services/joinRequest.service.js";

const CLUB_TTL = 300;        // 5 min — single club
const CLUBS_TTL = 120;       // 2 min — list of clubs
const MEMBERS_TTL = 120;     // 2 min — club members

const generateUniqueCode = () => {
  let code = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check if a user is the founder or an isHead member of a club.
 */
const isFounderOrHead = async (clubId, userId, founderId) => {
  if (founderId.toString() === userId.toString()) return true;
  const head = await ClubMember.findOne({ club: clubId, user: userId, isHead: true });
  return !!head;
};

// ── Controllers ───────────────────────────────────────────────────────────────

// POST /clubs/create
const createClub = asyncHandler(async (req, res) => {
  try {
    const { name, description, college, category, isPublic } = req.body;

    if (!name?.trim() || !college?.trim()) {
      throw new ApiError(400, "Name and college are required");
    }

    const logoLocalPath = req.file?.path;
    let logo = null;
    if (logoLocalPath) {
      const uploaded = await uploadOnCloudinary(logoLocalPath);
      if (uploaded?.url) logo = uploaded.url;
    }

    let clubCode = generateUniqueCode();
    while (await Club.findOne({ clubCode })) {
      clubCode = generateUniqueCode();
    }

    const club = await Club.create({
      name: name.trim(),
      description: description?.trim(),
      college: college.trim(),
      category,
      isPublic: isPublic !== undefined ? isPublic : true,
      founder: req.user._id,
      clubCode,
      logo,
    });

    // Auto-add founder as a ClubMember
    await ClubMember.create({
      club: club._id,
      user: req.user._id,
      position: "Founder",
      isHead: true,
      status: "active",
    });

    await cacheDel("clubs:all", `clubs:user:${req.user._id}`);
    return res.status(201).json(new ApiResponse(201, club, "Club created successfully"));
  } catch (error) {
    console.log("Error creating club", error);
    throw error;
  }
});

// GET /clubs/:clubId — public
const getClub = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.params;
    const cacheKey = `club:${clubId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "Club fetched successfully"));

    const club = await Club.findById(clubId)
      .populate("founder", "fullname username avatar")
      .lean();
    if (!club) throw new ApiError(404, "Club not found");

    await cacheSet(cacheKey, club, CLUB_TTL);
    return res.status(200).json(new ApiResponse(200, club, "Club fetched successfully"));
  } catch (error) {
    console.log("Error fetching club", error);
    throw error;
  }
});

// GET /clubs/all — public
const getAllClubs = asyncHandler(async (req, res) => {
  try {
    const cacheKey = "clubs:all";

    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "Clubs fetched successfully"));

    const clubs = await Club.find({ isPublic: true })
      .select("name logo college category founder clubCode")
      .populate("founder", "fullname username")
      .sort({ createdAt: -1 })
      .lean();

    await cacheSet(cacheKey, clubs, CLUBS_TTL);
    return res.status(200).json(new ApiResponse(200, clubs, "Clubs fetched successfully"));
  } catch (error) {
    console.log("Error fetching clubs", error);
    throw error;
  }
});

// GET /clubs/my-clubs — auth required
const getMyClubs = asyncHandler(async (req, res) => {
  try {
    const cacheKey = `clubs:user:${req.user._id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "My clubs fetched successfully"));

    const memberships = await ClubMember.find({ user: req.user._id })
      .populate({
        path: "club",
        select: "name logo college category founder clubCode isPublic",
        populate: { path: "founder", select: "fullname username" },
      })
      .lean();

    const result = memberships.map((m) => ({
      membership: {
        _id: m._id,
        position: m.position,
        isHead: m.isHead,
        status: m.status,
        joinedAt: m.joinedAt,
      },
      club: m.club,
    }));

    await cacheSet(cacheKey, result, CLUBS_TTL);
    return res.status(200).json(new ApiResponse(200, result, "My clubs fetched successfully"));
  } catch (error) {
    console.log("Error fetching my clubs", error);
    throw error;
  }
});

// PATCH /clubs/:clubId — auth required, founder only
const updateClub = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.params;
    const { name, description, college, category, isPublic } = req.body;

    const club = await Club.findById(clubId);
    if (!club) throw new ApiError(404, "Club not found");
    if (club.founder.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Only the founder can update the club");
    }

    const logoLocalPath = req.file?.path;
    if (logoLocalPath) {
      const uploaded = await uploadOnCloudinary(logoLocalPath);
      if (uploaded?.url) club.logo = uploaded.url;
    }

    if (name?.trim()) club.name = name.trim();
    if (description?.trim() !== undefined) club.description = description?.trim();
    if (college?.trim()) club.college = college.trim();
    if (category) club.category = category;
    if (isPublic !== undefined) club.isPublic = isPublic;

    const updated = await club.save();
    await cacheDel(`club:${clubId}`, "clubs:all");
    return res.status(200).json(new ApiResponse(200, updated, "Club updated successfully"));
  } catch (error) {
    console.log("Error updating club", error);
    throw error;
  }
});

// DELETE /clubs/:clubId — auth required, founder only
const deleteClub = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) throw new ApiError(404, "Club not found");
    if (club.founder.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Only the founder can delete the club");
    }

    await Promise.all([
      Club.findByIdAndDelete(clubId),
      ClubMember.deleteMany({ club: clubId }),
      JoinRequest.deleteMany({ club: clubId, type: "club" }),
    ]);

    await cacheDel(`club:${clubId}`, `club:members:${clubId}`, "clubs:all", `clubs:user:${req.user._id}`);
    return res.status(200).json(new ApiResponse(200, null, "Club deleted successfully"));
  } catch (error) {
    console.log("Error deleting club", error);
    throw error;
  }
});

// POST /clubs/join/:clubCode — auth required
const requestJoinClub = asyncHandler(async (req, res) => {
  try {
    const { clubCode } = req.params;

    const club = await Club.findOne({ clubCode });
    if (!club) throw new ApiError(404, "Club not found. Check the club code.");

    if (club.founder.toString() === req.user._id.toString()) {
      return res.status(400).json(new ApiResponse(400, null, "You are the founder of this club."));
    }

    const alreadyMember = await ClubMember.findOne({ club: club._id, user: req.user._id });
    if (alreadyMember) {
      return res.status(400).json(new ApiResponse(400, null, "You are already a member of this club."));
    }

    const result = await submitJoinRequest("club", {
      clubId: club._id,
      requesterId: req.user._id,
      requesterName: req.user.fullname || req.user.username,
      founderId: club.founder,
      clubName: club.name,
    });

    if (result.conflict) {
      return res.status(400).json(new ApiResponse(400, { status: result.status }, `Request already ${result.status}.`));
    }

    return res.status(201).json(new ApiResponse(201, { status: "pending" }, "Join request sent. Waiting for approval."));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(new ApiResponse(400, null, "You have already sent a request to this club."));
    }
    console.log("Error requesting to join club", error);
    throw error;
  }
});

// GET /clubs/join-requests/:clubId — auth required, founder or head
const getClubJoinRequests = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId).select("founder");
    if (!club) throw new ApiError(404, "Club not found");

    const canView = await isFounderOrHead(clubId, req.user._id, club.founder);
    if (!canView) throw new ApiError(403, "Only the founder or head members can view join requests");

    const requests = await getPendingRequests("club", { clubId });
    return res.status(200).json(new ApiResponse(200, requests, "Join requests fetched successfully"));
  } catch (error) {
    console.log("Error fetching club join requests", error);
    throw error;
  }
});

// PATCH /clubs/join-requests/handle/:requestId — auth required, founder or head
const handleClubJoinRequest = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json(new ApiResponse(400, null, "Action must be 'approve' or 'reject'"));
    }

    const result = await respondToRequest(requestId, action, req.user._id);

    if (result.notFound)       return res.status(404).json(new ApiResponse(404, null, "Join request not found"));
    if (result.forbidden)      return res.status(403).json(new ApiResponse(403, null, "Only the founder or head members can handle join requests"));
    if (result.alreadyHandled) return res.status(400).json(new ApiResponse(400, null, `Request already ${result.status}`));

    return res.status(200).json(new ApiResponse(200, { status: result.status, member: result.created }, `Request ${result.status} successfully`));
  } catch (error) {
    console.log("Error handling club join request", error);
    throw error;
  }
});

// GET /clubs/members/:clubId — public
const getClubMembers = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.params;
    const cacheKey = `club:members:${clubId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(new ApiResponse(200, cached, "Club members fetched successfully"));

    const [club, members] = await Promise.all([
      Club.findById(clubId).populate("founder", "fullname username avatar").lean(),
      ClubMember.find({ club: clubId })
        .populate("user", "fullname username avatar")
        .sort({ joinedAt: 1 })
        .lean(),
    ]);

    if (!club) throw new ApiError(404, "Club not found");

    const founderId = club.founder._id.toString();

    const activeMembers = [];
    const alumniMembers = [];

    for (const m of members) {
      const entry = {
        _id: m._id,
        user: m.user,
        position: m.position,
        isHead: m.isHead,
        status: m.status,
        joinedAt: m.joinedAt,
      };

      // Founder always goes first in active — skip duplicate
      if (m.user?._id?.toString() === founderId) continue;

      if (m.status === "active") {
        activeMembers.push(entry);
      } else {
        alumniMembers.push(entry);
      }
    }

    // Prepend founder to active list
    const founderEntry = {
      _id: club.founder._id,
      user: club.founder,
      position: "Founder",
      isHead: true,
      status: "active",
    };
    activeMembers.unshift(founderEntry);

    const result = { activeMembers, alumniMembers };
    await cacheSet(cacheKey, result, MEMBERS_TTL);
    return res.status(200).json(new ApiResponse(200, result, "Club members fetched successfully"));
  } catch (error) {
    console.log("Error fetching club members", error);
    throw error;
  }
});

// PATCH /clubs/members/:clubMemberId/position — auth required, founder or head
const assignPosition = asyncHandler(async (req, res) => {
  try {
    const { clubMemberId } = req.params;
    const { position, isHead } = req.body;

    const clubMember = await ClubMember.findById(clubMemberId);
    if (!clubMember) throw new ApiError(404, "Club member not found");

    const club = await Club.findById(clubMember.club).select("founder");
    if (!club) throw new ApiError(404, "Club not found");

    const canManage = await isFounderOrHead(club._id, req.user._id, club.founder);
    if (!canManage) throw new ApiError(403, "Only the founder or head members can assign positions");

    // Cannot change the founder's position
    if (clubMember.user.toString() === club.founder.toString()) {
      throw new ApiError(400, "Cannot change the founder's position");
    }

    if (position !== undefined) clubMember.position = position;
    if (isHead !== undefined) clubMember.isHead = isHead;

    const updated = await clubMember.save();
    await cacheDel(`club:members:${club._id}`);
    return res.status(200).json(new ApiResponse(200, updated, "Position updated successfully"));
  } catch (error) {
    console.log("Error assigning position", error);
    throw error;
  }
});

// PATCH /clubs/members/:clubMemberId/alumni — auth required, founder or head
const markAsAlumni = asyncHandler(async (req, res) => {
  try {
    const { clubMemberId } = req.params;

    const clubMember = await ClubMember.findById(clubMemberId);
    if (!clubMember) throw new ApiError(404, "Club member not found");

    const club = await Club.findById(clubMember.club).select("founder");
    if (!club) throw new ApiError(404, "Club not found");

    const canManage = await isFounderOrHead(club._id, req.user._id, club.founder);
    if (!canManage) throw new ApiError(403, "Only the founder or head members can mark alumni");

    if (clubMember.user.toString() === club.founder.toString()) {
      throw new ApiError(400, "Cannot mark the founder as alumni directly. Use transfer foundership first.");
    }

    clubMember.status = "alumni";
    const updated = await clubMember.save();
    await cacheDel(`club:members:${club._id}`);
    return res.status(200).json(new ApiResponse(200, updated, "Member marked as alumni"));
  } catch (error) {
    console.log("Error marking as alumni", error);
    throw error;
  }
});

// DELETE /clubs/members/:clubMemberId/remove — auth required, founder or head
const removeMember = asyncHandler(async (req, res) => {
  try {
    const { clubMemberId } = req.params;

    const clubMember = await ClubMember.findById(clubMemberId);
    if (!clubMember) throw new ApiError(404, "Club member not found");

    const club = await Club.findById(clubMember.club).select("founder");
    if (!club) throw new ApiError(404, "Club not found");

    const canManage = await isFounderOrHead(club._id, req.user._id, club.founder);
    if (!canManage) throw new ApiError(403, "Only the founder or head members can remove members");

    if (clubMember.user.toString() === club.founder.toString()) {
      throw new ApiError(400, "Cannot remove the founder. Transfer foundership first.");
    }

    await ClubMember.findByIdAndDelete(clubMemberId);
    await cacheDel(`club:members:${club._id}`, `clubs:user:${clubMember.user}`);
    return res.status(200).json(new ApiResponse(200, null, "Member removed successfully"));
  } catch (error) {
    console.log("Error removing member", error);
    throw error;
  }
});

// PATCH /clubs/:clubId/transfer-founder — auth required, current founder only
const transferFoundership = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.params;
    const { newFounderId } = req.body;

    if (!newFounderId) throw new ApiError(400, "newFounderId is required");

    const club = await Club.findById(clubId);
    if (!club) throw new ApiError(404, "Club not found");

    if (club.founder.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Only the current founder can transfer foundership");
    }

    if (newFounderId.toString() === req.user._id.toString()) {
      throw new ApiError(400, "You are already the founder");
    }

    // New founder must be an active member
    const newFounderMembership = await ClubMember.findOne({
      club: clubId,
      user: newFounderId,
      status: "active",
    });
    if (!newFounderMembership) {
      throw new ApiError(400, "The new founder must be an active club member");
    }

    // Update old founder's membership → alumni / Past Founder
    await ClubMember.findOneAndUpdate(
      { club: clubId, user: req.user._id },
      { position: "Past Founder", isHead: false, status: "alumni" }
    );

    // Update new founder's membership
    await ClubMember.findByIdAndUpdate(newFounderMembership._id, {
      position: "Founder",
      isHead: true,
      status: "active",
    });

    // Update Club document
    club.founder = newFounderId;
    await club.save();

    await cacheDel(`club:${clubId}`, `club:members:${clubId}`, `clubs:user:${req.user._id}`, `clubs:user:${newFounderId}`);
    return res.status(200).json(new ApiResponse(200, { newFounder: newFounderId }, "Foundership transferred successfully"));
  } catch (error) {
    console.log("Error transferring foundership", error);
    throw error;
  }
});

// DELETE /clubs/:clubId/leave — auth required, active members only (founder cannot leave)
const leaveClub = asyncHandler(async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId).select("founder");
    if (!club) throw new ApiError(404, "Club not found");

    if (club.founder.toString() === req.user._id.toString()) {
      throw new ApiError(400, "Founder cannot leave. Transfer foundership first.");
    }

    const membership = await ClubMember.findOne({ club: clubId, user: req.user._id, status: "active" });
    if (!membership) throw new ApiError(404, "You are not an active member of this club");

    await ClubMember.findByIdAndDelete(membership._id);
    await cacheDel(`club:members:${clubId}`, `clubs:user:${req.user._id}`);

    return res.status(200).json(new ApiResponse(200, null, "You have left the club"));
  } catch (error) {
    console.log("Error leaving club", error);
    throw error;
  }
});

export {
  createClub,
  getClub,
  getAllClubs,
  getMyClubs,
  updateClub,
  deleteClub,
  requestJoinClub,
  getClubJoinRequests,
  handleClubJoinRequest,
  getClubMembers,
  assignPosition,
  markAsAlumni,
  removeMember,
  transferFoundership,
  leaveClub,
};
