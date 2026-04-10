import Router from "express";
import { saveContest, getContest, startContest, endContest } from "../controllers/contest.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const contestRouter = Router();

contestRouter.get("/:eventId",          verifyJWT, getContest);
contestRouter.post("/:eventId",         verifyJWT, saveContest);
contestRouter.patch("/:eventId/start",  verifyJWT, startContest);
contestRouter.patch("/:eventId/end",    verifyJWT, endContest);

export default contestRouter;
