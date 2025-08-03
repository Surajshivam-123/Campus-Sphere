import { Team } from "../models/team.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

const generateUniqueCode = () => {
  let code = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+=?|`~";
  const length = characters.length;
  for (let i = 0; i < 5; i++) {
    code += characters.charAt(Math.floor(Math.random() * length));
  }
  return code;
};

const createTeam = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    const { eventId } = req.params;
    const teamlogo = req.file?.path;
    if (!name) {
      throw new ApiError(404, "Name of Team is required");
    }
    if (!eventId) {
      throw new ApiError(404, "Event id is required");
    }
    let teamCode = generateUniqueCode();
    while (await Team.findOne({ teamCode })) {
      teamCode = generateUniqueCode();
    }
    const team = await Team.create({
      name,
      event: eventId,
      owner: req.user._id,
      teamlogo,
      teamCode,
      teamPlayer: [],
    });
    if (!team) {
      throw new ApiError(404, "Error while creating team");
    }
    res
      .status(201)
      .json(new ApiResponse(200, team, "Team created successfully"));
  } catch (error) {
    console.log("Error while creating team", error);
  }
});

const getTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const team = await Team.findOne({ event: eventId, owner: req.user._id });
    if (!team) {
      throw new ApiError(404, "Team not found");
    }
    res.status(200).json(new ApiResponse(200, team, "Team found successfully"));
  } catch (error) {
    console.log("Error while getting team", error);
  }
});

const updateTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name } = req.body;
    const teamlogo = req.file?.path;
    if (!eventId) {
      throw new ApiError(400, "EventId is required");
    }
    const team = await Team.findOne({ event: eventId, owner: req.user?._id });
    if (!team) {
      throw new ApiError(404, "Team not found");
    }
    if (name) {
      team.name = name;
    }
    if (teamlogo) {
      team.teamlogo = teamlogo;
    }
    const updatedTeam = await Team.findByIdAndUpdate(team._id, team, {
      new: true,
    });
    if (!updatedTeam) {
      throw new ApiError(400, "Error while updating team");
    }
    res
      .status(200)
      .json(new ApiResponse(200, updatedTeam, "Team updated successfully"));
  } catch (error) {
    console.log("Error while updating team", error);
  }
});

const deleteTeam = asyncHandler(async(req,res)=>{
  try {
    const {eventId}=req.params;
    const team=await Team.findOneAndDelete({event:eventId,owner:req.user._id});
    if(!team){
      throw new ApiError(404,"Team not found");
    }
    res.status(200).json(new ApiResponse(200,team,"Team deleted successfully"))
  } catch (error) {
    console.log("Error while deleting team",error);
  }
})
export { createTeam, getTeam, updateTeam ,deleteTeam};
