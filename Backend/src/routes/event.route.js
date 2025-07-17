import Router from "express";
import { createEvent, deleteEvent, updateEvent, getallEvents ,getsingleEvent} from '../controllers/event.controller.js'
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";


const eventRouter=Router();

eventRouter.route('/create').post(verifyJWT,upload.single('poster'),createEvent);
eventRouter.route('/delete/:eventId').delete(verifyJWT,deleteEvent);
eventRouter.route('/update/:eventId').patch(verifyJWT,upload.single('poster'),updateEvent);
eventRouter.route('/get-all-events').get(verifyJWT,getallEvents);
eventRouter.route('/get-single-event/:eventId').get(getsingleEvent);

export default eventRouter;