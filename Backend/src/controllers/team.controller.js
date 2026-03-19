import { Team } from "../models/team.model.js";
import { Cricket_Player } from "../models/cricket_player.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateUniqueCode = () => {
  let code = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
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
    const teamlogoLocalPath = req.file?.path;
    
    if (!name) {
      throw new ApiError(404, "Name of Team is required");
    }
    if (!eventId) {
      throw new ApiError(404, "Event id is required");
    }
    
    let teamlogo = null;
    if (teamlogoLocalPath) {
      const uploadedLogo = await uploadOnCloudinary(teamlogoLocalPath);
      if (uploadedLogo) {
        teamlogo = uploadedLogo.url;
      }
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
      return res.status(200).json(new ApiResponse(200, null, "Team Not found"));
    }

    const players = await Cricket_Player.find({ team: team._id })
      .populate("owner", "fullname username email avatar");

    const data = {
      _id: team._id,
      name: team.name,
      teamlogo: team.teamlogo,
      teamCode: team.teamCode,
      event: team.event,
      teamPlayer: players.map((p) => ({
        _id: p._id,
        name: p.owner?.fullname || p.owner?.username || "Unknown",
        runs: p.runs,
        wickets: p.wickets,
        balls: p.balls,
        overs: p.overs,
      })),
    };

    res.status(200).json(new ApiResponse(200, data, "Team found successfully"));
  } catch (error) {
    console.log("Error while getting team", error);
  }
});

const updateTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name } = req.body;
    const teamlogoLocalPath = req.file?.path;
    
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
    if (teamlogoLocalPath) {
      const uploadedLogo = await uploadOnCloudinary(teamlogoLocalPath);
      if (uploadedLogo) {
        team.teamlogo = uploadedLogo.url;
      }
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

const deleteTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const team = await Team.findOneAndDelete({
      event: eventId,
      owner: req.user._id,
    });
    if (!team) {
      throw new ApiError(404, "Team not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, team, "Team deleted successfully"));
  } catch (error) {
    console.log("Error while deleting team", error);
  }
});

// const joinTeam = asyncHandler(async (req, res) => {
//   try {
//     const { teamCode } = req.params;
//     const team = await Team.findOne({ teamCode });
//     if (!team) {
//       throw new Error("Team not found");
//     }
//     res.status(200).json(new ApiResponse(200, team, "Team found successfully"));
//   } catch (error) {
//     console.log("Error while joining team", error);
//   }
// });


export { createTeam,
         getTeam,
         updateTeam,
         deleteTeam,
};
