import Router from "express";
import {
  loginLimiter,
  registerLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  refreshTokenLimiter,
} from "../middlewares/rateLimiter.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUser,
  googleAuthCallback,
  sendOtp,
  verifyOtp,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  updateProfile,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import passport from "../config/passport.js";

const userRouter = Router();

userRouter.route('/register').post(
    registerLimiter, upload.single('avatar'), registerUser
)

userRouter.route("/register/send-otp").post(otpSendLimiter, sendRegistrationOtp);
userRouter.route("/register/verify-otp").post(otpVerifyLimiter, verifyRegistrationOtp);

userRouter.route("/login").post(loginLimiter, loginUser)
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshTokenLimiter, refreshToken);
userRouter.route("/profile")
  .get(verifyJWT, getUser)
  .patch(verifyJWT, upload.single("avatar"), updateProfile);

// OTP login
userRouter.route("/send-otp").post(otpSendLimiter, sendOtp);
userRouter.route("/verify-otp").post(otpVerifyLimiter, verifyOtp);

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
        return res.redirect(`${process.env.FRONTEND_ORIGIN_WITH_PATH || "http://localhost:5173"}/login?error=oauth_error`);
      }
      if (!user) {
        console.error("Google OAuth no user:", info);
        return res.redirect(`${process.env.FRONTEND_ORIGIN_WITH_PATH || "http://localhost:5173"}/login?error=no_user`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleAuthCallback
);

export default userRouter;