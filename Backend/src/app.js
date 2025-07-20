import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
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
import particpantRouter from "./routes/participant.route.js";


app.use("/api/cpsh/users", userRouter);
app.use("/api/cpsh/events", eventRouter);
app.use("/api/cpsh/participants", particpantRouter);
app.use("/api/cpsh/members", particpantRouter);

export { app };
