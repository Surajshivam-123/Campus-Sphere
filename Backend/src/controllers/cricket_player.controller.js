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
    res.status(500).json(new ApiResponse(500, null, error.message || "Error joining team"));
  }
});
const getMyTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) throw new Error("Event id is required");

    // First find the team for this event
    const team = await Team.findOne({ event: eventId })
      .populate("owner", "fullname username email avatar");

    if (!team) throw new Error("No team found for this event");

    // Check the logged-in user is actually a player in this team
    const myPlayerRecord = await Cricket_Player.findOne({
      owner: req.user._id,
      team: team._id,
    });

    if (!myPlayerRecord) {
      throw new Error("You are not a player in any team for this event");
    }

    // Fetch all players in this team with their user details
    const teammates = await Cricket_Player.find({ team: team._id })
      .populate("owner", "fullname username email avatar");

    const data = {
      team: {
        _id: team._id,
        name: team.name,
        teamlogo: team.teamlogo,
        teamCode: team.teamCode,
        event: team.event,
      },
      captain: team.owner,
      players: teammates.map((p) => ({
        _id: p._id,
        name: p.owner?.fullname || p.owner?.username || "Unknown",
        runs: p.runs,
        wickets: p.wickets,
        balls: p.balls,
        overs: p.overs,
      })),
    };
    // console.log("Data: ",data);
    res.status(200).json(new ApiResponse(200, data, "Team fetched successfully"));
  } catch (error) {
    console.log("Error while fetching team", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error fetching team"));
  }
});

const removePlayer = asyncHandler(async (req, res) => {
  try {
    const { playerId } = req.params;
    if (!playerId) throw new Error("Player id is required");

    // Find the player record and verify the requesting user owns the team
    const playerRecord = await Cricket_Player.findById(playerId).populate("team");
    if (!playerRecord) throw new Error("Player not found");

    if (playerRecord.team.owner.toString() !== req.user._id.toString()) {
      throw new Error("Only the team captain can remove players");
    }

    await Cricket_Player.findByIdAndDelete(playerId);
    res.status(200).json(new ApiResponse(200, {}, "Player removed successfully"));
  } catch (error) {
    console.log("Error while removing player", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error removing player"));
  }
});

const leaveTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) throw new Error("Event id is required");

    // Find the team for this event
    const team = await Team.findOne({ event: eventId });
    if (!team) throw new Error("No team found for this event");

    // Check if user is the owner/captain — captain cannot leave
    if (team.owner.toString() === req.user._id.toString()) {
      throw new Error("Captain cannot leave the team");
    }

    const player = await Cricket_Player.findOneAndDelete({
      owner: req.user._id,
      team: team._id,
    });

    if (!player) throw new Error("You are not a player in this team");

    res.status(200).json(new ApiResponse(200, {}, "Left team successfully"));
  } catch (error) {
    console.log("Error while leaving team", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error leaving team"));
  }
});

export { joinTeam, getMyTeam, leaveTeam, removePlayer };
