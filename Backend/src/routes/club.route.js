import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
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
} from "../controllers/club.controller.js";
import { getMessages, deleteMessage } from "../controllers/clubChat.controller.js";

const clubRouter = Router();

// Public
clubRouter.route("/all").get(getAllClubs);
clubRouter.route("/members/:clubId").get(getClubMembers);

// Auth required — specific paths before /:clubId to avoid conflicts
clubRouter.route("/create").post(verifyJWT, upload.single("logo"), createClub);
clubRouter.route("/my-clubs").get(verifyJWT, getMyClubs);
clubRouter.route("/join/:clubCode").post(verifyJWT, requestJoinClub);
clubRouter.route("/join-requests/handle/:requestId").patch(verifyJWT, handleClubJoinRequest);
clubRouter.route("/join-requests/:clubId").get(verifyJWT, getClubJoinRequests);
clubRouter.route("/members/:clubMemberId/position").patch(verifyJWT, assignPosition);
clubRouter.route("/members/:clubMemberId/alumni").patch(verifyJWT, markAsAlumni);
clubRouter.route("/members/:clubMemberId/remove").delete(verifyJWT, removeMember);

// Dynamic :clubId routes
clubRouter.route("/:clubId/transfer-founder").patch(verifyJWT, transferFoundership);
clubRouter.route("/:clubId/leave").delete(verifyJWT, leaveClub);

// ── Chat routes — defined directly to avoid mergeParams issues ──
clubRouter.route("/:clubId/chat/messages").get(verifyJWT, getMessages);
clubRouter.route("/:clubId/chat/messages/:messageId").delete(verifyJWT, deleteMessage);

// /:clubId CRUD — last to avoid shadowing
clubRouter.route("/:clubId")
  .get(getClub)
  .patch(verifyJWT, upload.single("logo"), updateClub)
  .delete(verifyJWT, deleteClub);

export default clubRouter;
