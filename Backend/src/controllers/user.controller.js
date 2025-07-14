import { User } from "../models/user.models.js";
//import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const genetateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password} = req.body;
    console.log("Request Body:", req.body);
    console.log("FileInfo:", req.body);
    if (
      [fullname, username, email, password].some((field) => field.trim() === "")
    ) {
      throw new ApiError(400, "All mandatory fields are required");
    }
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }
    const avatar= req.file?.path || "";
    // const avatar=await uploadOnCloudinary(avatarLocalPath);
    // console.log("Avatar",avatar)
    const user = await User.create({
      fullname,
      username,
      email,
      password,
      avatar
    });
    if (!user) {
      throw new ApiError(
        400,
        "Something went wrong while registering the user"
      );
    }
    res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!(email || username)) {
      throw new ApiError(400, "Email or UserName is required");
    }
    const finduser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (!finduser) {
      throw new ApiError(400, "User is not registered");
    }
    const validPassword = await finduser.isPasswordCorrect(password);
    if (!validPassword) {
      throw new ApiError(400, "Wrong Password");
    }
    const { accessToken, refreshToken } = await genetateAccessAndRefreshToken(
      finduser._id
    );
    const loggedinuser = await User.findById(finduser._id).select(
      "-password -refreshToken"
    );
    const cookieoptions = {
      httpOnly: true,
      secure: true,
    };
    res.cookie("accessToken", accessToken, cookieoptions);
    res.cookie("refreshToken", refreshToken, cookieoptions);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: loggedinuser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while logging out");
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  try {
    const incomingrefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingrefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?.id);
    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }
    if (user.refreshToken !== incomingrefreshToken) {
      throw new ApiError(401, "Invalid Token");
    }
    const { accessToken, refreshToken } = await genetateAccessAndRefreshToken(
      user._id
    );
    const cookieoptions = {
      httpOnly: true,
      secure: true,
    };
    res
    .status(200)
    .cookie("accessToken",accessToken,cookieoptions)
    .cookie("refreshToken",refreshToken,cookieoptions)
    .json(
        new ApiResponse(200,{accessToken,refreshToken},"Access Token refreshed!")
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken
}