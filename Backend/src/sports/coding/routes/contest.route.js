import Router from "express";
import {
  saveContest, getContest, scheduleContest,
  startContest, pauseContest, resumeContest,
  extendContest, endContest, restartContest,
} from "../controllers/contest.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { verifyEventOrganizer } from "../../../middlewares/eventAccess.middleware.js";

const contestRouter = Router();

contestRouter.get("/:eventId",              verifyJWT, getContest);
contestRouter.post("/:eventId",             verifyJWT, verifyEventOrganizer, saveContest);
contestRouter.patch("/:eventId/schedule",   verifyJWT, verifyEventOrganizer, scheduleContest);
contestRouter.patch("/:eventId/start",      verifyJWT, verifyEventOrganizer, startContest);
contestRouter.patch("/:eventId/pause",      verifyJWT, verifyEventOrganizer, pauseContest);
contestRouter.patch("/:eventId/resume",     verifyJWT, verifyEventOrganizer, resumeContest);
contestRouter.patch("/:eventId/extend",     verifyJWT, verifyEventOrganizer, extendContest);
contestRouter.patch("/:eventId/end",        verifyJWT, verifyEventOrganizer, endContest);
contestRouter.patch("/:eventId/restart",    verifyJWT, verifyEventOrganizer, restartContest);

export default contestRouter;
