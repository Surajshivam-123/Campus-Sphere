import Router from "express";
import { joinTeam } from "../controllers/cricket_player.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const cricketPlayerRouter=Router();

cricketPlayerRouter.route('/join-team/:teamCode/:eventId').post(verifyJWT,joinTeam);

export default cricketPlayerRouter;