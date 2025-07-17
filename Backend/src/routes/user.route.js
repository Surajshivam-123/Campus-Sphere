import Router from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route('/register').post(
    upload.single('avatar'),registerUser
)

userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post(verifyJWT,logoutUser);
userRouter.route("/refresh-token").post(refreshToken);

export default userRouter;