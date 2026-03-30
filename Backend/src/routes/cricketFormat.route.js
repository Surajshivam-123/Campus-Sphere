import Router from "express";
import { saveFormat, getFormat } from "../controllers/cricketFormat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const cricketFormatRouter = Router();

cricketFormatRouter.route("/:eventId").post(verifyJWT, saveFormat);
cricketFormatRouter.route("/:eventId").get(verifyJWT, getFormat);

export default cricketFormatRouter;
