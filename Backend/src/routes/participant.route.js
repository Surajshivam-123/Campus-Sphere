import Router from 'express';
import { participateEvent,getEvent ,getMyEvent,getAllParticipant,getSingleParticipant,deleteParticipant} from '../controllers/participant.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const participantRouter=Router();

participantRouter.route('/participate/:participantCode').post(verifyJWT,participateEvent).get(verifyJWT,getEvent);
participantRouter.route('/my-events').get(verifyJWT,getMyEvent);
participantRouter.route('/get-all-participants/:eventId').get(verifyJWT,getAllParticipant);
participantRouter.route('/get-single-participant/:eventId').get(verifyJWT,getSingleParticipant);
participantRouter.route('/delete-participant/:participantId').delete(verifyJWT,deleteParticipant);

// Check if current user is a participant of an event
participantRouter.route('/check/:eventId').get(verifyJWT, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const participant = await import("../models/participant.model.js").then(m =>
      m.Participant.findOne({ event: eventId, owner: userId }).lean()
    );
    res.json({ success: true, isParticipant: !!participant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default participantRouter;