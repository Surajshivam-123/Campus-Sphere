import Router from 'express';
import { createTeam ,getTeam,updateTeam,deleteTeam} from '../controllers/team.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js';

const teamRouter=Router();
teamRouter.route('/create-team/:eventId').post(verifyJWT,upload.single("teamlogo"),createTeam);
teamRouter.route('/get-team/:eventId').get(verifyJWT,getTeam);
teamRouter.route('/update-team/:eventId').patch(verifyJWT,upload.single("teamlogo"),updateTeam);
teamRouter.route('/delete-team/:eventId').delete(verifyJWT,deleteTeam);
export default teamRouter;