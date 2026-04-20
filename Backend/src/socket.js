import { Server } from "socket.io";
import { config } from "./config/index.js";
import { activeSocketConnections } from "./utils/metrics.js";
import { ClubMessage } from "./models/clubMessage.model.js";
import { Club } from "./models/club.model.js";
import { ClubMember } from "./models/clubMember.model.js";

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
