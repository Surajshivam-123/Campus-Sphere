import Router from "express";
import {
  saveContest, getContest, scheduleContest,
  startContest, pauseContest, resumeContest,
  extendContest, endContest, restartContest,
} from "../controllers/contest.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const contestRouter = Router();

contestRouter.get("/:eventId",              verifyJWT, getContest);
contestRouter.post("/:eventId",             verifyJWT, saveContest);
contestRouter.patch("/:eventId/schedule",   verifyJWT, scheduleContest);
contestRouter.patch("/:eventId/start",      verifyJWT, startContest);
contestRouter.patch("/:eventId/pause",      verifyJWT, pauseContest);
contestRouter.patch("/:eventId/resume",     verifyJWT, resumeContest);
contestRouter.patch("/:eventId/extend",     verifyJWT, extendContest);
contestRouter.patch("/:eventId/end",        verifyJWT, endContest);
contestRouter.patch("/:eventId/restart",    verifyJWT, restartContest);

export default contestRouter;
