import { Server } from "socket.io";
import { config } from "./config/index.js";
import { activeSocketConnections } from "./utils/metrics.js";

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

    // Coding contest rooms
    socket.on("join:contest", (eventId) => {
      socket.join(`event:${eventId}`);
    });
    socket.on("leave:contest", (eventId) => {
      socket.leave(`event:${eventId}`);
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
