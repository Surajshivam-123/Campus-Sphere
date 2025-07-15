import asyncHandler from "../utils/AsyncHandler.js";
import { Event } from "../models/event.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";


const generateUniqueCode=()=>{
    let code=""
    const characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*-+*/?<>~";
    const length=characters.length;
    for(let i=0;i<5;i++){
        code+=characters.charAt(Math.floor(Math.random()*length));
    }
    return code;
}

const createEvent = asyncHandler(async (req, res) => {
  try {
    const {
      festivalName,
      eventName,
      startDate,
      location,
      organization,
      description,
      mode,
      category,
      sports,
      others,
      cultural,
      maxParticipants,
      rules
    } = req.body;
    if (
      !eventName.trim() ||
      !eventDate.trim() ||
      !location.trim() ||
      !organization.trim() ||
      !description.trim() ||
      !mode.trim() ||
      !category.trim() ||
      !maxParticipants
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const poster = req.file.path;
    if (!poster) {
      throw new ApiError(400, "Poster is required");
    }
    let memberCode = generateUniqueCode();
    let participantCode = generateUniqueCode();
    while(await Event.findOne({memberCode})){
        memberCode=generateUniqueCode();
    }
    while(await Event.findOne({participantCode})){
        participantCode=generateUniqueCode();
    }
    const event = await Event.create({
      festivalName,
      eventName,
      startDate,
      location,
      organization,
      organizer: req.user._id,
      description,
      mode,
      category,
      sports,
      cultural,
      others,
      maxParticipants,
      rules,
      poster,
      memberCode,
      participantCode,
    });
    if (!event) {
      throw new ApiError(400, "Error while creating event");
    }
    res
      .status(201)
      .json(new ApiResponse(201, event, "Event created successfully"));
  } catch (error) {
    console.log("Error while creating event", error);
  }
});

const deleteEvent=asyncHandler(async(req,res)=>{
    try {
        const {eventId}=req.params;
        const event=await Event.findByIdAndDelete(eventId);
        if(!event){
            throw new ApiError(404,"Event not found");
        }
        res.status(200).json(new ApiResponse(200,event,"Event deleted successfully"));
    } catch (error) {
        console.log("Error while deleting event",error);
    }
})

const updatefestivalName=asyncHandler(async(req,res)=>{
    try {
        const eventId=req.params.eventId;
        const festivalName=req.body
        if(!festivalName.trim()){
            throw new ApiError(400,"Festival name is required");
        }
        const event=await Event.findByIdAndUpdate(eventId,{festivalName},{new:true});
        if(!event){
            throw new ApiError(404,"Event not found");
        }
        res.status(200).json(new ApiResponse(200,event,"Festival name updated successfully"));
    } catch (error) {
        console.log("Error while updating event",error)
    }
})
export {createEvent,deleteEvent}
