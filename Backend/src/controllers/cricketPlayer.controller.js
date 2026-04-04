import asyncHandler from "../utils/AsyncHandler.js";
import {Team} from "../models/team.model.js";
import {Cricket_Player} from "../models/cricketPlayer.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";

const PLAYER_TTL = 120;

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
    await cacheDel(
      `myteam:event:${eventId}:user:${req.user._id}`,
      `team:event:${eventId}:owner:${req.user._id}`,
      `teams:event:${eventId}`
    );
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

    const cacheKey = `myteam:event:${eventId}:user:${req.user._id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Team fetched successfully"));
    }

    // Find the player record for this user in this event
    const allTeams = await Team.find({ event: eventId }).select("_id owner");
    const teamIds = allTeams.map((t) => t._id);

    const myPlayerRecord = await Cricket_Player.findOne({
      owner: req.user._id,
      team: { $in: teamIds },
    });

    if (!myPlayerRecord) {
      return res.status(200).json(new ApiResponse(200, null, "You are not a player in any team for this event"));
    }

    const team = await Team.findById(myPlayerRecord.team)
      .populate("owner", "fullname username email avatar");

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

    res.status(200).json(new ApiResponse(200, data, "Team fetched successfully"));
    await cacheSet(cacheKey, data, PLAYER_TTL);
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
    await cacheDel(`myteam:event:${playerRecord.team.event}:user:${playerRecord.owner}`);
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

    // Find the specific team the user is in for this event
    const allTeams = await Team.find({ event: eventId }).select("_id owner");
    const teamIds = allTeams.map((t) => t._id);

    const playerRecord = await Cricket_Player.findOne({
      owner: req.user._id,
      team: { $in: teamIds },
    });

    if (!playerRecord) throw new Error("You are not a player in any team for this event");

    // Check if user is the captain of that team — captain cannot leave
    const team = allTeams.find((t) => t._id.toString() === playerRecord.team.toString());
    if (team?.owner?.toString() === req.user._id.toString()) {
      throw new Error("Captain cannot leave the team. Delete the team instead.");
    }

    await Cricket_Player.findByIdAndDelete(playerRecord._id);
    await cacheDel(`myteam:event:${eventId}:user:${req.user._id}`);
    res.status(200).json(new ApiResponse(200, {}, "Left team successfully"));
  } catch (error) {
    console.log("Error while leaving team", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Error leaving team"));
  }
});

export { joinTeam, getMyTeam, leaveTeam, removePlayer };
