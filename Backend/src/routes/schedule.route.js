import Router from "express";
import { generateAutoSchedule, saveManualSchedule, getSchedule } from "../controllers/schedule.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const scheduleRouter = Router();

scheduleRouter.get("/:eventId", verifyJWT, getSchedule);
scheduleRouter.post("/:eventId/auto", verifyJWT, generateAutoSchedule);
scheduleRouter.post("/:eventId/manual", verifyJWT, saveManualSchedule);

export default scheduleRouter;
