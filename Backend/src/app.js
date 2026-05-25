import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import passport from "./config/passport.js";
import { metricsMiddleware } from "./middlewares/metrics.middleware.js";
import { register } from "./utils/metrics.js";

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
app.use(metricsMiddleware);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// API Routes
import userRouter from "./routes/user.route.js";
import eventRouter from "./routes/event.route.js";
import participantRouter from "./routes/participant.route.js";
import memberRouter from "./routes/member.route.js";
import teamRouter from "./routes/team.route.js";
import scheduleRouter from "./routes/schedule.route.js";
import clubRouter from "./routes/club.route.js";
import eventMessageRouter from "./routes/eventMessage.route.js";
import teamMessageRouter from "./routes/teamMessage.route.js";

// Sports — Cricket
import cricketPlayerRouter from "./sports/cricket/routes/player.route.js";
import cricketFormatRouter from "./sports/cricket/routes/format.route.js";
import cricketMatchRouter from "./sports/cricket/routes/match.route.js";

// Coding Platform
import codingContestRouter from "./sports/coding/routes/contest.route.js";
import codingProblemRouter from "./sports/coding/routes/problem.route.js";
import codingSubmissionRouter from "./sports/coding/routes/submission.route.js";

// Core routes
app.use("/api/cpsh/users", userRouter);
app.use("/api/cpsh/events", eventRouter);
app.use("/api/cpsh/participants", participantRouter);
app.use("/api/cpsh/members", memberRouter);
app.use("/api/cpsh/teams", teamRouter);
app.use("/api/cpsh/schedule", scheduleRouter);
app.use("/api/cpsh/clubs", clubRouter);
app.use("/api/cpsh/event-messages", eventMessageRouter);
app.use("/api/cpsh/team-messages", teamMessageRouter);

// Cricket routes
app.use("/api/cpsh/cricket-players", cricketPlayerRouter);
app.use("/api/cpsh/cricket-format", cricketFormatRouter);
app.use("/api/cpsh/matches", cricketMatchRouter);

// Coding routes
app.use("/api/cpsh/coding/contest",     codingContestRouter);
app.use("/api/cpsh/coding/problems",    codingProblemRouter);
app.use("/api/cpsh/coding/submissions", codingSubmissionRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app };
