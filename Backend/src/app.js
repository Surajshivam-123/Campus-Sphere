import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://surajshivam-123.github.io"
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "50kb" }));

app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.get("/profile", (req, res) => {
  console.log(req.cookies);
});

import userRouter from "./routes/user.route.js";
import eventRouter from "./routes/event.route.js";
import participantRouter from "./routes/participant.route.js";
import memberRouter from "./routes/member.route.js";
import teamRouter from './routes/team.route.js'
import cricketPlayerRouter from "./routes/cricket_player.route.js";

app.use("/api/cpsh/users", userRouter);
app.use("/api/cpsh/events", eventRouter);
app.use("/api/cpsh/participants", participantRouter);
app.use("/api/cpsh/members", memberRouter);
app.use("/api/cpsh/teams",teamRouter);
app.use("/api/cpsh/cricket-players",cricketPlayerRouter);

export { app };
