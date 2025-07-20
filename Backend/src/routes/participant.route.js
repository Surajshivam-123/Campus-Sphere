import Router from 'express';
import { participateEvent,getEvent ,getMyEvent} from '../controllers/participant.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const particpantRouter=Router();

particpantRouter.route('/participate/:participantCode').post(verifyJWT,participateEvent).get(verifyJWT,getEvent);
particpantRouter.route('/my-events').get(verifyJWT,getMyEvent);


export default particpantRouter;