import Router from "express";
import { participateEvent ,getEvent,getAllEvents} from "../controllers/member.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const memberRouter=Router();


memberRouter.route('/participate/:memberCode').post(verifyJWT,participateEvent).get(verifyJWT,getEvent);
memberRouter.route('/get-all-events').get(verifyJWT,getAllEvents);

export default memberRouter;