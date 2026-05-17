import Router from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUser,
  googleAuthCallback,
  sendOtp,
  verifyOtp,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import passport from "../config/passport.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.single("avatar"),
  validate(registerSchema),
  registerUser
);

userRouter.route("/login").post(
  validate(loginSchema),
  loginUser
);
userRouter.route("/logout").post(verifyJWT,logoutUser);
userRouter.route("/refresh-token").post(refreshToken);
userRouter.route("/profile").get(verifyJWT,getUser);

// OTP login
userRouter.route("/send-otp").post(sendOtp);
userRouter.route("/verify-otp").post(verifyOtp);

// Google OAuth
userRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

userRouter.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect(`${process.env.FRONTEND_ORIGIN_WITH_PATH || "http://localhost:5173"}/Campus-Sphere/login?error=oauth_error`);
      }
      if (!user) {
        console.error("Google OAuth no user:", info);
        return res.redirect(`${process.env.FRONTEND_ORIGIN_WITH_PATH || "http://localhost:5173"}/Campus-Sphere/login?error=no_user`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleAuthCallback
);

export default userRouter;