import Router from "express";
import { submitCode, getSubmission, getMySubmissions, getLeaderboard } from "../controllers/submission.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { verifyEventAccess } from "../../../middlewares/eventAccess.middleware.js";

const submissionRouter = Router();

submissionRouter.post("/event/:eventId/problem/:problemId", verifyJWT, verifyEventAccess, submitCode);
submissionRouter.get("/event/:eventId/leaderboard",         verifyJWT, verifyEventAccess, getLeaderboard);
submissionRouter.get("/event/:eventId/mine",                verifyJWT, verifyEventAccess, getMySubmissions);
submissionRouter.get("/:submissionId",                      verifyJWT, getSubmission);

export default submissionRouter;
