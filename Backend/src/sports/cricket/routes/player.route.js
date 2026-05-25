import Router from "express";
import { joinTeam, getMyTeam, leaveTeam, removePlayer } from "../controllers/player.controller.js";
import {
  requestJoinTeam,
  getJoinRequests,
  respondToJoinRequest,
  getMyRequestStatus,
  getEventJoinRequests,
} from "../controllers/joinRequest.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const cricketPlayerRouter = Router();

cricketPlayerRouter.route('/join-team/:teamCode/:eventId').post(verifyJWT, joinTeam);
cricketPlayerRouter.get("/my-team/:eventId", verifyJWT, getMyTeam);
cricketPlayerRouter.delete("/leave-team/:eventId", verifyJWT, leaveTeam);
cricketPlayerRouter.delete("/remove-player/:playerId", verifyJWT, removePlayer);

// Join request flow
cricketPlayerRouter.post("/request-join/:teamCode/:eventId", verifyJWT, requestJoinTeam);
cricketPlayerRouter.get("/join-requests/:eventId", verifyJWT, getJoinRequests);
cricketPlayerRouter.get("/event-join-requests/:eventId", verifyJWT, getEventJoinRequests);
cricketPlayerRouter.patch("/join-requests/:requestId", verifyJWT, respondToJoinRequest);
cricketPlayerRouter.get("/join-request-status/:teamCode/:eventId", verifyJWT, getMyRequestStatus);

export default cricketPlayerRouter;