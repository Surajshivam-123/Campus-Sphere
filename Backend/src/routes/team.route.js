import Router from 'express';
import { createTeam ,getTeam} from '../controllers/team.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const teamRouter=Router();
teamRouter.route('/create-team/:eventId'.post(verifyJWT,createTeam));
teamRouter.route('/get-team/:eventId').get(verifyJWT,getTeam);

export default teamRouter;