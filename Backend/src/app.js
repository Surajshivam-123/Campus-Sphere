import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// API Routes
import userRouter from "./routes/user.route.js";
import eventRouter from "./routes/event.route.js";
import participantRouter from "./routes/participant.route.js";
import memberRouter from "./routes/member.route.js";
import teamRouter from "./routes/team.route.js";
import cricketPlayerRouter from "./routes/cricket_player.route.js";
import cricketFormatRouter from "./routes/cricketFormat.route.js";
import scheduleRouter from "./routes/schedule.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/participants", participantRouter);
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/cricket-players", cricketPlayerRouter);
app.use("/api/v1/cricket-format", cricketFormatRouter);
app.use("/api/v1/schedule", scheduleRouter);

// Legacy routes (for backward compatibility - can be removed later)
app.use("/api/cpsh/users", userRouter);
app.use("/api/cpsh/events", eventRouter);
app.use("/api/cpsh/participants", participantRouter);
app.use("/api/cpsh/members", memberRouter);
app.use("/api/cpsh/teams", teamRouter);
app.use("/api/cpsh/cricket-players", cricketPlayerRouter);
app.use("/api/cpsh/cricket-format", cricketFormatRouter);
app.use("/api/cpsh/schedule", scheduleRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app };
