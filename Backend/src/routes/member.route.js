import Router from "express";
import {
  participateEvent,
  getEvent,
  getAllEvents,
  editRole,
  getMember,
  getJoinRequests,
  handleJoinRequest,
} from "../controllers/member.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const memberRouter = Router();

// User: preview event by member code, then send join request
memberRouter.route("/participate/:memberCode")
  .get(verifyJWT, getEvent)
  .post(verifyJWT, participateEvent);

// User: get all events they are a member of
memberRouter.route("/get-all-events").get(verifyJWT, getAllEvents);

// Organizer: approve or reject a join request (must be before /:eventId to avoid conflict)
memberRouter.route("/join-requests/handle/:requestId").patch(verifyJWT, handleJoinRequest);

// Organizer: list pending join requests for an event
memberRouter.route("/join-requests/:eventId").get(verifyJWT, getJoinRequests);

// Organizer: edit a member's role
memberRouter.route("/edit-role/:memberId").patch(verifyJWT, editRole);

// Get all members of an event
memberRouter.route("/get-member/:eventId").get(verifyJWT, getMember);

// Check if current user is a member of an event
memberRouter.route("/check/:eventId").get(verifyJWT, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const member = await import("../models/members.model.js").then(m => 
      m.Member.findOne({ event: eventId, owner: userId }).lean()
    );
    res.json({ success: true, isMember: !!member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default memberRouter;
