import { Server } from "socket.io";
import { config } from "./config/index.js";
import { activeSocketConnections } from "./utils/metrics.js";
import { ClubMessage } from "./models/clubMessage.model.js";
import { Club } from "./models/club.model.js";
import { ClubMember } from "./models/clubMember.model.js";
import { EventMessage } from "./models/eventMessage.model.js";
import { Event } from "./models/event.model.js";
import { Member } from "./models/members.model.js";
import { Participant } from "./models/participant.model.js";
import { TeamMessage } from "./models/teamMessage.model.js";
import { Team } from "./models/team.model.js";
import { Cricket_Player } from "./sports/cricket/models/player.model.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    activeSocketConnections.inc();

    socket.on("disconnect", () => {
      activeSocketConnections.dec();
    });
    // Client joins a room for a specific match or event
    socket.on("join:match", (matchId) => {
      socket.join(`match:${matchId}`);
    });

    socket.on("join:event", (eventId) => {
      socket.join(`event:${eventId}`);
    });

    socket.on("leave:match", (matchId) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on("leave:event", (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    // Personal rooms for join request notifications
    socket.on("join:user", (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on("join:captain", (userId) => {
      socket.join(`captain:${userId}`);
    });

    // Organizer room for member join request notifications
    socket.on("join:organizer", (userId) => {
      socket.join(`organizer:${userId}`);
    });

    // Founder room for club join request notifications
    socket.on("join:founder", (userId) => {
      socket.join(`founder:${userId}`);
    });

    // Club chat rooms — only active members join via HTTP auth check first
    socket.on("join:club:chat", (clubId) => {
      socket.join(`club:chat:${clubId}`);
    });

    socket.on("leave:club:chat", (clubId) => {
      socket.leave(`club:chat:${clubId}`);
    });

    // Send a chat message — save and broadcast immediately, no extra DB membership check
    socket.on("club:chat:send", async ({ clubId, text, senderId, senderName, senderAvatar, tempId }) => {
      try {
        if (!clubId || !text?.trim() || !senderId) return;

        const message = await ClubMessage.create({
          club: clubId,
          sender: senderId,
          text: text.trim(),
        });

        const payload = {
          _id: message._id,
          tempId,
          club: clubId,
          text: message.text,
          deleted: false,
          createdAt: message.createdAt,
          sender: {
            _id: senderId,
            fullname: senderName,
            avatar: senderAvatar,
          },
        };

        // Broadcast to everyone in the room including sender
        io.to(`club:chat:${clubId}`).emit("club:chat:message", payload);
      } catch (err) {
        console.error("[club:chat:send] error:", err.message);
        socket.emit("club:chat:error", { tempId, message: "Failed to send message." });
      }
    });

    // Delete a message — sender or founder/head
    socket.on("club:chat:delete", async ({ clubId, messageId, requesterId }) => {
      try {
        const message = await ClubMessage.findById(messageId);
        if (!message || message.club.toString() !== clubId) return;

        const isSender = message.sender.toString() === requesterId;
        if (!isSender) {
          const club = await Club.findById(clubId).select("founder").lean();
          const isFounder = club?.founder.toString() === requesterId;
          const isHead = await ClubMember.findOne({ club: clubId, user: requesterId, isHead: true }).lean();
          if (!isFounder && !isHead) return;
        }

        message.deleted = true;
        message.text = "This message was deleted.";
        await message.save();

        io.to(`club:chat:${clubId}`).emit("club:chat:deleted", { messageId });
      } catch (err) {
        console.error("[club:chat:delete] error:", err.message);
      }
    });

    // Coding contest rooms
    socket.on("join:contest", (eventId) => {
      socket.join(`event:${eventId}`);
    });
    socket.on("leave:contest", (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    // Event chat rooms - join with authorization check
    socket.on("join:event:chat", async ({ eventId, userId }) => {
      try {
        if (!eventId || !userId) return;

        const event = await Event.findById(eventId).select("organizer").lean();
        if (!event) return;

        const isOrganizer = event.organizer.toString() === userId;
        const isMember = await Member.findOne({ event: eventId, owner: userId }).lean();
        const isParticipant = await Participant.findOne({ event: eventId, owner: userId }).lean();

        if (!isOrganizer && !isMember && !isParticipant) return;

        socket.join(`event:chat:${eventId}`);
      } catch (err) {
        console.error("[join:event:chat] error:", err.message);
      }
    });

    socket.on("leave:event:chat", (eventId) => {
      socket.leave(`event:chat:${eventId}`);
    });

    // Send event chat message
    socket.on("event:chat:send", async ({ eventId, text, senderId, senderName, senderAvatar, tempId }) => {
      try {
        if (!eventId || !text?.trim() || !senderId) return;

        const event = await Event.findById(eventId).select("organizer").lean();
        if (!event) return;

        const isOrganizer = event.organizer.toString() === senderId;
        const isMember = await Member.findOne({ event: eventId, owner: senderId }).lean();
        const isParticipant = await Participant.findOne({ event: eventId, owner: senderId }).lean();

        if (!isOrganizer && !isMember && !isParticipant) return;

        const message = await EventMessage.create({
          event: eventId,
          sender: senderId,
          text: text.trim(),
        });

        const payload = {
          _id: message._id,
          tempId,
          event: eventId,
          text: message.text,
          deleted: false,
          createdAt: message.createdAt,
          sender: {
            _id: senderId,
            fullname: senderName,
            avatar: senderAvatar,
          },
        };

        io.to(`event:chat:${eventId}`).emit("event:chat:message", payload);
      } catch (err) {
        console.error("[event:chat:send] error:", err.message);
        socket.emit("event:chat:error", { tempId, message: "Failed to send message." });
      }
    });

    // Delete event chat message - sender or organizer
    socket.on("event:chat:delete", async ({ eventId, messageId, requesterId }) => {
      try {
        const message = await EventMessage.findById(messageId);
        if (!message || message.event.toString() !== eventId) return;

        const isSender = message.sender.toString() === requesterId;
        if (!isSender) {
          const event = await Event.findById(eventId).select("organizer").lean();
          if (event?.organizer.toString() !== requesterId) return;
        }

        message.deleted = true;
        message.text = "This message was deleted.";
        await message.save();

        io.to(`event:chat:${eventId}`).emit("event:chat:deleted", { messageId });
      } catch (err) {
        console.error("[event:chat:delete] error:", err.message);
      }
    });

    // ── Team Chat ──────────────────────────────────────────────────────────────
    // Join team chat room — only captain or registered player can join
    socket.on("join:team:chat", async ({ teamId, userId }) => {
      try {
        if (!teamId || !userId) return;

        const team = await Team.findById(teamId).select("owner").lean();
        if (!team) return;

        const isCaptain = team.owner.toString() === userId;
        const isPlayer = await Cricket_Player.findOne({ team: teamId, owner: userId }).lean();

        if (!isCaptain && !isPlayer) return;

        socket.join(`team:chat:${teamId}`);
      } catch (err) {
        console.error("[join:team:chat] error:", err.message);
      }
    });

    socket.on("leave:team:chat", (teamId) => {
      socket.leave(`team:chat:${teamId}`);
    });

    // Send team chat message — any team member (captain or player) can send
    socket.on("team:chat:send", async ({ teamId, eventId, text, senderId, senderName, senderAvatar, tempId }) => {
      try {
        if (!teamId || !text?.trim() || !senderId) return;

        const team = await Team.findById(teamId).select("owner event").lean();
        if (!team) return;

        // Must be captain OR a registered player in the team
        const isCaptain = team.owner.toString() === senderId;
        const isPlayer = await Cricket_Player.findOne({ team: teamId, owner: senderId }).lean();

        if (!isCaptain && !isPlayer) {
          socket.emit("team:chat:error", { tempId, message: "You are not a member of this team." });
          return;
        }

        const resolvedEventId = eventId || team.event?.toString();

        const message = await TeamMessage.create({
          team: teamId,
          event: resolvedEventId,
          sender: senderId,
          text: text.trim(),
        });

        const payload = {
          _id: message._id,
          tempId,
          team: teamId,
          text: message.text,
          deleted: false,
          createdAt: message.createdAt,
          sender: {
            _id: senderId,
            fullname: senderName,
            avatar: senderAvatar,
          },
        };

        io.to(`team:chat:${teamId}`).emit("team:chat:message", payload);
      } catch (err) {
        console.error("[team:chat:send] error:", err.message);
        socket.emit("team:chat:error", { tempId, message: "Failed to send message." });
      }
    });

    // Delete team chat message — captain only
    socket.on("team:chat:delete", async ({ teamId, messageId, requesterId }) => {
      try {
        const message = await TeamMessage.findById(messageId);
        if (!message || message.team.toString() !== teamId) return;

        const team = await Team.findById(teamId).select("owner").lean();
        const isCaptain = team?.owner.toString() === requesterId;
        const isSender = message.sender.toString() === requesterId;

        if (!isSender && !isCaptain) return;

        message.deleted = true;
        message.text = "This message was deleted.";
        await message.save();

        io.to(`team:chat:${teamId}`).emit("team:chat:deleted", { messageId });
      } catch (err) {
        console.error("[team:chat:delete] error:", err.message);
      }
    });
  });

  return io;
};

// Emit updated match to everyone watching that match or its event scoreboard
export const emitMatchUpdate = (match) => {
  if (!io) return;
  io.to(`match:${match._id}`).emit("match:updated", match);
  io.to(`event:${match.event}`).emit("match:updated", match);
};

export const getIO = () => io;
