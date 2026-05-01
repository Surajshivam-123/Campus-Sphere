import express from "express";
import { TeamMessage } from "../models/teamMessage.model.js";
import { Team } from "../models/team.model.js";
import { Cricket_Player } from "../sports/cricket/models/player.model.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/cpsh/team-messages/:teamId?page=1&limit=50
router.get("/:teamId", verifyJWT, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    const team = await Team.findById(teamId).select("owner event").lean();
    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    // Allow: captain (owner) or any player registered to this team
    const isCaptain = team.owner.toString() === userId.toString();
    const isPlayer = await Cricket_Player.findOne({
      team: teamId,
      owner: userId,
    }).lean();

    if (!isCaptain && !isPlayer) {
      return res
        .status(403)
        .json({ error: "You are not a member of this team." });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await TeamMessage.find({ team: teamId, deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("sender", "fullname avatar")
      .lean();

    const total = await TeamMessage.countDocuments({
      team: teamId,
      deleted: false,
    });

    res.json({
      messages: messages.reverse(),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      teamName: team.name,
      isCaptain,
    });
  } catch (err) {
    console.error("[team:chat:messages] error:", err.message);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

export default router;
