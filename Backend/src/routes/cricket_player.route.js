import Router from "express";
import { joinTeam ,getMyTeam,leaveTeam, removePlayer} from "../controllers/cricket_player.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const cricketPlayerRouter=Router();

cricketPlayerRouter.route('/join-team/:teamCode/:eventId').post(verifyJWT,joinTeam);
cricketPlayerRouter.get("/my-team/:eventId", verifyJWT, getMyTeam);
cricketPlayerRouter.delete("/leave-team/:eventId", verifyJWT, leaveTeam);
cricketPlayerRouter.delete("/remove-player/:playerId", verifyJWT, removePlayer);

export default cricketPlayerRouter;