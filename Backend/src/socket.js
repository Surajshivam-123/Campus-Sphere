import { Server } from "socket.io";
import { config } from "./config/index.js";

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
