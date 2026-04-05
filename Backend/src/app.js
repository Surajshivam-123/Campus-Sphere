import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import passport from "./config/passport.js";

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
app.use(passport.initialize());

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
import scheduleRouter from "./routes/schedule.route.js";

// Sports — Cricket
import cricketPlayerRouter from "./sports/cricket/routes/player.route.js";
import cricketFormatRouter from "./sports/cricket/routes/format.route.js";
import cricketMatchRouter from "./sports/cricket/routes/match.route.js";

// Core routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/participants", participantRouter);
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/schedule", scheduleRouter);

// Cricket routes — namespaced under /sports/cricket
app.use("/api/v1/sports/cricket/players", cricketPlayerRouter);
app.use("/api/v1/sports/cricket/format", cricketFormatRouter);
app.use("/api/v1/sports/cricket/matches", cricketMatchRouter);

// Legacy routes (backward compatibility)
app.use("/api/cpsh/users", userRouter);
app.use("/api/cpsh/events", eventRouter);
app.use("/api/cpsh/participants", participantRouter);
app.use("/api/cpsh/members", memberRouter);
app.use("/api/cpsh/teams", teamRouter);
app.use("/api/cpsh/schedule", scheduleRouter);
app.use("/api/cpsh/cricket-players", cricketPlayerRouter);
app.use("/api/cpsh/cricket-format", cricketFormatRouter);
app.use("/api/cpsh/matches", cricketMatchRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app };
