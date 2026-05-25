import Router from "express";
import {
  initMatchesFromSchedule,
  getEventMatches,
  getMatch,
  startMatch,
  addDelivery,
  updateMatch,
  submitSquad,
  confirmPlayingXI,
  getEventLiveStatus,
} from "../controllers/match.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { verifyEventAccess } from "../../../middlewares/eventAccess.middleware.js";

const matchRouter = Router();

matchRouter.get("/event/:eventId/is-live", getEventLiveStatus);  // public — no auth
matchRouter.get("/event/:eventId", verifyJWT, verifyEventAccess, getEventMatches);
matchRouter.get("/:matchId", verifyJWT, verifyEventAccess, getMatch);

matchRouter.post("/event/:eventId/init", verifyJWT, verifyEventAccess, initMatchesFromSchedule);
matchRouter.patch("/:matchId/start", verifyJWT, verifyEventAccess, startMatch);
matchRouter.post("/:matchId/delivery", verifyJWT, verifyEventAccess, addDelivery);
matchRouter.patch("/:matchId", verifyJWT, verifyEventAccess, updateMatch);
matchRouter.post("/:matchId/submit-squad", verifyJWT, verifyEventAccess, submitSquad);
matchRouter.post("/:matchId/confirm-xi", verifyJWT, verifyEventAccess, confirmPlayingXI);

export default matchRouter;
