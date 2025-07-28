import { Participant } from "../models/participant.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";

const participateEvent = asyncHandler(async (req, res) => {
  try {
    const { invitationCode, identityNumber } = req.body;
    if (!invitationCode || !identityNumber) {
      throw new ApiError(400, "All fields are required");
    }
    const event = await Event.findOne({ participantCode: invitationCode });
    if (!event) {
      res.status(404).json(ApiResponse(404, "Event not found"));
    }
    const participantExists = await Participant.findOne({ identityNumber });
    if (participantExists) {
      res.status(400).json(ApiResponse(400, {}, "Participant already exists"));
    }
    const participant = await Participant.create({
      owner: req.user._id,
      event: event._id,
      identityNumber,
    });
    if (!participant) {
      throw new ApiError(400, "Error while creating participant");
    }
    res
      .status(201)
      .json(
        new ApiResponse(201, participant, "Participant created successfully")
      );
  } catch (error) {
    console.log("Error while creating participant", error);
  }
});

const getEvent = asyncHandler(async (req, res) => {
  try {
    const { participantCode } = req.params;
    if (!participantCode) {
      throw new ApiError(400, "Participant code is required");
    }
    const event = await Event.findOne({ participantCode: participantCode });
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event found successfully"));
  } catch (error) {
    console.log("Error while getting event", error);
  }
});

const getMyEvent = asyncHandler(async (req, res) => {
  try {
    const participate = await Participant.find({ owner: req.user._id });
    if (!participate) {
      res.status(400).json(new ApiResponse(200, {}, "No Events Found"));
    }
    let myEvent = [];
    for (let i = 0; i < participate.length; i++) {
      myEvent.push(await Event.findById(participate[i].event));
    }
    res
      .status(200)
      .json(new ApiResponse(200, myEvent, "Events found successfully"));
  } catch (error) {}
});

const getAllParticipant =asyncHandler(async(req,res)=>{
  try {
    const {eventId}=req.params;
    const participants=await Participant.find({event:eventId});
    if(!participants){
      throw new ApiError(404,"Participants not found")
    }
    res.status(200).json(new ApiResponse(200,participants,"Participants found successfully"))
  } catch (error) {
    console.log("Error while getting all participants",error)
  }
})

const getSingleParticipant =asyncHandler(async(req,res)=>{
  try {
    const {eventId}=req.params;
    const participants=await Participant.find({event:eventId,owner:req.user._id});
    if(!participants){
      throw new ApiError(404,"Participants not found")
    }
    res.status(200).json(new ApiResponse(200,participants,"Participants found successfully"))
  } catch (error) {
    console.log("Error while getting single participants",error)
  }
})
export { participateEvent, getEvent, getMyEvent ,getAllParticipant,getSingleParticipant};
