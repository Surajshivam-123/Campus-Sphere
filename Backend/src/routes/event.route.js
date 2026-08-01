import Router from "express";
import { createEvent, deleteEvent, updateEvent, getallEvents, getsingleEvent, getPublicEvents, assignScorer, revokeScorer, generateEventPoster } from '../controllers/event.controller.js'
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


const eventRouter=Router();

eventRouter.route('/generate-poster').post(verifyJWT, generateEventPoster);
eventRouter.route('/create').post(verifyJWT,upload.single('poster'),createEvent);
eventRouter.route('/delete/:eventId').delete(verifyJWT,deleteEvent);
eventRouter.route('/update/:eventId').patch(verifyJWT,upload.single('poster'),updateEvent);
eventRouter.route('/get-all-events').get(verifyJWT,getallEvents);
eventRouter.route('/get-single-event/:eventId').get(getsingleEvent);
eventRouter.route('/public').get(getPublicEvents);
eventRouter.route('/:eventId/assign-scorer').patch(verifyJWT, assignScorer);
eventRouter.route('/:eventId/revoke-scorer').delete(verifyJWT, revokeScorer);

export default eventRouter;