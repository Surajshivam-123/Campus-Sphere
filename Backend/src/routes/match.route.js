import Router from "express";
import {
  initMatchesFromSchedule,
  getEventMatches,
  getMatch,
  startMatch,
  addDelivery,
  updateMatch,
} from "../controllers/match.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyEventAccess } from "../middlewares/eventAccess.middleware.js";

const matchRouter = Router();

// View — must be logged in AND involved in the event
matchRouter.get("/event/:eventId", verifyJWT, verifyEventAccess, getEventMatches);
matchRouter.get("/:matchId", verifyJWT, verifyEventAccess, getMatch);

// Manage — must be logged in AND involved in the event
matchRouter.post("/event/:eventId/init", verifyJWT, verifyEventAccess, initMatchesFromSchedule);
matchRouter.patch("/:matchId/start", verifyJWT, verifyEventAccess, startMatch);
matchRouter.post("/:matchId/delivery", verifyJWT, verifyEventAccess, addDelivery);
matchRouter.patch("/:matchId", verifyJWT, verifyEventAccess, updateMatch);

export default matchRouter;
