import Router from 'express';
import { participateEvent,getEvent ,getMyEvent,getAllParticipant,getSingleParticipant,deleteParticipant} from '../controllers/participant.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const participantRouter=Router();

participantRouter.route('/participate/:participantCode').post(verifyJWT,participateEvent).get(verifyJWT,getEvent);
participantRouter.route('/my-events').get(verifyJWT,getMyEvent);
participantRouter.route('/get-all-participants/:eventId').get(verifyJWT,getAllParticipant);
participantRouter.route('/get-single-participant/:eventId').get(verifyJWT,getSingleParticipant);
participantRouter.route('/delete-participant/:participantId').delete(verifyJWT,deleteParticipant);

export default participantRouter;