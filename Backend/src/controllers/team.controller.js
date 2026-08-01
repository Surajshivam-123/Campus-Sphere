import { Team } from "../models/team.model.js";
import { Cricket_Player } from "../sports/cricket/models/player.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";
import fs from "fs";
import path from "path";

const TEAM_TTL = 300;       // 5 min — single team with players
const TEAMS_TTL = 120;      // 2 min — all teams for an event

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
    const { name, teamlogoUrl } = req.body;
    const { eventId } = req.params;
    const teamlogoLocalPath = req.file?.path;
    
    if (!name) {
      throw new ApiError(404, "Name of Team is required");
    }
    if (!eventId) {
      throw new ApiError(404, "Event id is required");
    }
    
    let teamlogo = teamlogoUrl || null;
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
    await cacheDel(`teams:event:${eventId}`);
    res
      .status(201)
      .json(new ApiResponse(200, team, "Team created successfully"));
  } catch (error) {
    console.log("Error while creating team", error);
    throw error;
  }
});

const getTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const cacheKey = `team:event:${eventId}:owner:${req.user._id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Team found successfully"));
    }

    const team = await Team.findOne({ event: eventId, owner: req.user._id })
      .populate("owner", "fullname username email avatar")
      .lean();
    if (!team) {
      return res.status(200).json(new ApiResponse(200, null, "Team Not found"));
    }

    const players = await Cricket_Player.find({ team: team._id })
      .populate("owner", "fullname username email avatar")
      .lean();

    const captainId = team.owner._id.toString();

    const captain = {
      _id: team.owner._id,
      name: team.owner.fullname || team.owner.username || "Unknown",
      isCaptain: true,
    };

    const teamPlayers = players
      .filter((p) => p.owner?._id?.toString() !== captainId)
      .map((p) => ({
        _id: p._id,
        isCaptain: false,
        name: p.owner?.fullname || p.owner?.username || "Unknown",
        runs: p.runs,
        wickets: p.wickets,
        balls: p.balls,
        overs: p.overs,
      }));

    const data = {
      _id: team._id,
      name: team.name,
      teamlogo: team.teamlogo,
      teamCode: team.teamCode,
      event: team.event,
      teamPlayer: [captain, ...teamPlayers],
    };

    await cacheSet(cacheKey, data, TEAM_TTL);
    res.status(200).json(new ApiResponse(200, data, "Team found successfully"));
  } catch (error) {
    console.log("Error while getting team", error);
    throw error;
  }
});

const updateTeam = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, teamlogoUrl } = req.body;
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
    } else if (teamlogoUrl) {
      team.teamlogo = teamlogoUrl;
    }
    const updatedTeam = await Team.findByIdAndUpdate(team._id, team, {
      new: true,
    });
    if (!updatedTeam) {
      throw new ApiError(400, "Error while updating team");
    }
    await cacheDel(
      `team:event:${eventId}:owner:${req.user._id}`,
      `teams:event:${eventId}`
    );
    res
      .status(200)
      .json(new ApiResponse(200, updatedTeam, "Team updated successfully"));
  } catch (error) {
    console.log("Error while updating team", error);
    throw error;
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
    await cacheDel(
      `team:event:${eventId}:owner:${req.user._id}`,
      `teams:event:${eventId}`
    );
    res
      .status(200)
      .json(new ApiResponse(200, team, "Team deleted successfully"));
  } catch (error) {
    console.log("Error while deleting team", error);
    throw error;
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


const getEventTeams = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      throw new ApiError(400, "EventId is required");
    }
    const cacheKey = `teams:event:${eventId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json(new ApiResponse(200, cached, "Teams fetched successfully"));
    }

    const teams = await Team.find({ event: eventId })
      .select("name teamlogo teamCode owner")
      .populate("owner", "fullname username")
      .lean();
    await cacheSet(cacheKey, teams, TEAMS_TTL);
    res.status(200).json(new ApiResponse(200, teams, "Teams fetched successfully"));
  } catch (error) {
    console.log("Error while getting event teams", error);
    throw error;
  }
});

const generateTeamLogo = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    throw new ApiError(400, "Prompt is required");
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    throw new ApiError(500, "Gemini API key is not configured");
  }

  try {
    const systemPrompt = `You are a professional SVG designer. Generate a beautiful, modern, clean, colorful vector logo/shield/insignia for a sports/coding team based on the user's description.
                          Requirements:
                          - Return ONLY valid raw SVG XML code starting with '<svg' and ending with '</svg>'.
                          - Do not include markdown code block styling (such as \`\`\`xml or \`\`\`svg).
                          - Ensure it is a complete, self-contained SVG with standard namespaces (xmlns="http://www.w3.org/2000/svg"), viewBox="0 0 100 100", width, and height.
                          - Design a stunning, stylized team emblem matching the prompt: "${prompt}".
                          - Do not include any text explanation or extra whitespace before or after the SVG tag.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini logo API error:", geminiRes.status, errText);
      throw new Error(`Gemini API returned status ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    let rawSvg = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up markdown block wrapping if present
    rawSvg = rawSvg.replace(/```xml|```svg|```/gi, "").trim();

    if (!rawSvg.startsWith("<svg") && rawSvg.includes("<svg")) {
      rawSvg = rawSvg.substring(rawSvg.indexOf("<svg"));
    }
    if (rawSvg.includes("</svg>")) {
      rawSvg = rawSvg.substring(0, rawSvg.indexOf("</svg>") + 6);
    }

    if (!rawSvg || !rawSvg.startsWith("<svg")) {
      throw new Error("Failed to generate a valid SVG logo");
    }

    // Write temp SVG file
    const tempDir = path.resolve("./public/temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `teamlogo-${Date.now()}.svg`);
    fs.writeFileSync(tempFilePath, rawSvg);

    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(tempFilePath);
    if (!uploadResult?.url) {
      throw new Error("Failed to upload logo to Cloudinary");
    }

    res
      .status(200)
      .json(new ApiResponse(200, { url: uploadResult.url }, "Logo generated successfully"));
  } catch (error) {
    console.error("Error in generateTeamLogo:", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Failed to generate logo"));
  }
});

export { createTeam,
         getTeam,
         updateTeam,
         deleteTeam,
         getEventTeams,
         generateTeamLogo,
};
