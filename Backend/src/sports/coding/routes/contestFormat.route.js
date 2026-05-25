import Router from "express";
import { saveContestFormat, getContestFormat } from "../controllers/contestFormat.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { verifyEventAccess } from "../../../middlewares/eventAccess.middleware.js";

const contestFormatRouter = Router();

contestFormatRouter.get("/:eventId",  verifyJWT, verifyEventAccess, getContestFormat);
contestFormatRouter.post("/:eventId", verifyJWT, saveContestFormat);

export default contestFormatRouter;
