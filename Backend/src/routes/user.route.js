import Router from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUser
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
userRouter.route("/profile").get(verifyJWT,getUser);

export default userRouter;