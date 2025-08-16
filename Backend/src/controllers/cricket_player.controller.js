import asyncHandler from "../utils/AsyncHandler.js";
import {Team} from "../models/team.model.js";
import {Cricket_Player} from "../models/cricket_player.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const joinTeam = asyncHandler(async (req, res) => {
  try {
    const { teamCode ,eventId} = req.params;
    if(!teamCode){
        throw new Error("Team code is required");
    }
    if(!eventId){
        throw new Error("Event id is required");
    }
    const team = await Team.findOne({ teamCode ,event:eventId});
    if (!team) {
      throw new Error("Team not found");
    }
    const playerexist=await Cricket_Player.findOne({team:team._id,owner:req.user._id});
    if(playerexist){
        throw new Error("Player already exists");
    }
    const player = await Cricket_Player.create({
      team: team._id,
      owner: req.user._id,
    });
    if (!player) {
      throw new Error("Error while joining team");
    }
    res
      .status(200)
      .json(new ApiResponse(200, player, "Team joined successfully"));
  } catch (error) {
    console.log("Error while joining team", error);
  }
});

export { joinTeam };
