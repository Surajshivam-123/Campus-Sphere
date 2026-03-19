import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import userService from "../services/user.service.js";
import { HTTP_STATUS, COOKIE_OPTIONS } from "../constants/index.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  // Validate required fields
  if ([fullname, username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "All fields are required");
  }

  const avatarPath = req.file?.path;
  const { user, accessToken, refreshToken } = await userService.registerUser(
    { fullname, username, email, password },
    avatarPath
  );

  res
    .status(HTTP_STATUS.CREATED)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(HTTP_STATUS.CREATED, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { usermail, password } = req.body;

  // Validate required fields
  if (!usermail || !password) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email/username and password are required");
  }

  const { user, accessToken, refreshToken } = await userService.loginUser(
    usermail,
    password
  );

  res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await userService.logoutUser(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, "User logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Refresh token is required");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await userService.refreshAccessToken(incomingRefreshToken);

  res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    );
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user, "User retrieved successfully"));
});
export { registerUser, loginUser, logoutUser, refreshToken, getUser };
