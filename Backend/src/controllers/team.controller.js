import { Team } from "../models/team.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

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
    const { teamlogo } = req.file;
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

const getTeam = asyncHandler(async(req,res)=>{
  try {
    const {eventId}=req.params;
    const team=await Team.find({event:eventId,owner:req.user._id});
    if(!team){
      throw new ApiError(404,"Team not found");
    }
    res.status(200).json(new ApiResponse(200,team,"Team found successfully"))
  } catch (error) {
    console.log("Error while getting team",error);
  }
})

export { createTeam , getTeam};
