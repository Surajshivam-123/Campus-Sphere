import Router from "express";
import { participateEvent } from "../controllers/member.controller";

const memberRouter=Router();


memberRouter.route('/participate/:invitationCode').post(participateEvent);


export default memberRouter;