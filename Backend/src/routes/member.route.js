import Router from "express";
import { participateEvent ,getEvent,getAllEvents,editRole,getMember} from "../controllers/member.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const memberRouter=Router();


memberRouter.route('/participate/:memberCode').post(verifyJWT,participateEvent).get(verifyJWT,getEvent);
memberRouter.route('/get-all-events').get(verifyJWT,getAllEvents);
memberRouter.route('/edit-role/:memberId').patch(verifyJWT,editRole);
memberRouter.route('/get-member/:eventId').get(verifyJWT,getMember);

export default memberRouter;