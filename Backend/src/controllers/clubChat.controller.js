import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ClubMessage } from "../models/clubMessage.model.js";
import { ClubMember } from "../models/clubMember.model.js";
import { Club } from "../models/club.model.js";

const PAGE_SIZE = 40;

/**
 * Check if a user is an active member or founder of a club.
 */
const isMemberOrFounder = async (clubId, userId) => {
  const club = await Club.findById(clubId).select("founder").lean();
  if (!club) return false;
  if (club.founder.toString() === userId.toString()) return true;
  const membership = await ClubMember.findOne({ club: clubId, user: userId, status: "active" }).lean();
  return !!membership;
};

// GET /clubs/:clubId/chat/messages?before=<messageId>
// Paginated history — members only, 40 messages per page, cursor-based
const getMessages = asyncHandler(async (req, res) => {
  const { clubId } = req.params;
  const { before } = req.query;
  const allowed = await isMemberOrFounder(clubId, req.user._id);
  console 
  if (!allowed) throw new ApiError(403, "Only club members can read messages");

  const filter = { club: clubId };
  if (before) {
    const pivot = await ClubMessage.findById(before).select("createdAt").lean();
    if (pivot) filter.createdAt = { $lt: pivot.createdAt };
  }

  const messages = await ClubMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(PAGE_SIZE)
    .populate("sender", "fullname username avatar")
    .lean();

  // Return oldest-first so the UI can append naturally
  messages.reverse();

  return res.status(200).json(
    new ApiResponse(200, { messages, hasMore: messages.length === PAGE_SIZE }, "Messages fetched")
  );
});

// DELETE /clubs/:clubId/chat/messages/:messageId
// Soft-delete — sender can delete their own; founder/head can delete any
const deleteMessage = asyncHandler(async (req, res) => {
  const { clubId, messageId } = req.params;

  const message = await ClubMessage.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");
  if (message.club.toString() !== clubId) throw new ApiError(400, "Message does not belong to this club");

  const isSender = message.sender.toString() === req.user._id.toString();

  if (!isSender) {
    // Check if requester is founder or head
    const club = await Club.findById(clubId).select("founder").lean();
    const isFounder = club?.founder.toString() === req.user._id.toString();
    const isHead = await ClubMember.findOne({ club: clubId, user: req.user._id, isHead: true }).lean();
    if (!isFounder && !isHead) throw new ApiError(403, "You can only delete your own messages");
  }

  message.deleted = true;
  message.text = "This message was deleted.";
  await message.save();

  return res.status(200).json(new ApiResponse(200, { messageId: message._id }, "Message deleted"));
});

export { getMessages, deleteMessage, isMemberOrFounder };
