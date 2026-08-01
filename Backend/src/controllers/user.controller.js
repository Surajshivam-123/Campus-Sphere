import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import userService from "../services/user.service.js";
import { HTTP_STATUS, COOKIE_OPTIONS } from "../constants/index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";

const validatePassword = (password) => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  if (!/[@$!%*?&#^()\-_+=\[\]{}|;:,./<>~`]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }
  return { isValid: true };
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, verificationToken, avatarUrl } = req.body;

  // Validate required fields
  if ([fullname, username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "All fields are required");
  }

  if (!verificationToken?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email verification token is required");
  }

  // Validate password strength
  const pwdValidation = validatePassword(password);
  if (!pwdValidation.isValid) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, pwdValidation.message);
  }

  const avatarPath = req.file?.path;
  const { user, accessToken, refreshToken } = await userService.registerUser(
    { fullname, username, email, password, verificationToken, avatarUrl },
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

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is required");
  }
  await userService.sendLoginOtp(email);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, {}, "OTP sent to your email"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email?.trim() || !otp?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email and OTP are required");
  }
  const { user, accessToken, refreshToken } = await userService.verifyLoginOtp(email, otp);
  res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(new ApiResponse(HTTP_STATUS.OK, { user, accessToken, refreshToken }, "Logged in successfully"));
});

const googleAuthCallback = asyncHandler(async (req, res) => {
  // req.user is set by passport after successful Google auth
  const { user, accessToken, refreshToken } = await userService.googleLogin(req.user);

  const frontendUrl = (process.env.FRONTEND_ORIGIN || "http://localhost:5173").replace(/\/$/, "");

  res
    .status(HTTP_STATUS.OK)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
});

const sendRegistrationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email is required");
  }
  await userService.sendRegistrationOtp(email);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, {}, "Verification OTP sent to your email"));
});

const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email?.trim() || !otp?.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Email and OTP are required");
  }
  const { verificationToken } = await userService.verifyRegistrationOtp(email, otp);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { verificationToken }, "Email verified successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullname, avatarUrl } = req.body;
  const updateData = {};

  if (fullname !== undefined) {
    if (!fullname.trim()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Full name cannot be empty");
    }
    updateData.fullname = fullname;
  }

  if (avatarUrl !== undefined) {
    updateData.avatar = avatarUrl;
  }

  // Handle avatar upload if provided (file upload overrides avatarUrl)
  const avatarPath = req.file?.path;
  if (avatarPath) {
    const avatar = await uploadOnCloudinary(avatarPath);
    if (avatar?.url) {
      updateData.avatar = avatar.url;
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No fields provided for update");
  }

  const updatedUser = await userService.updateUserProfile(req.user._id, updateData);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, updatedUser, "Profile updated successfully"));
});

const generateAvatar = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Prompt is required");
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Gemini API key is not configured");
  }

  try {
    const systemPrompt = `You are a professional SVG designer. Generate a beautiful, modern, clean, colorful vector avatar SVG based on the user's description.
                          Requirements:
                          - Return ONLY valid raw SVG XML code starting with '<svg' and ending with '</svg>'.
                          - Do not include markdown code block styling (such as \`\`\`xml or \`\`\`svg).
                          - Ensure it is a complete, self-contained SVG with standard namespaces (xmlns="http://www.w3.org/2000/svg"), viewBox="0 0 100 100", width, and height.
                          - Design a stunning, stylized vector portrait/graphic matching the prompt: "${prompt}".
                          - Do not include any text explanation or extra whitespace before or after the SVG tag.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini avatar API error:", geminiRes.status, errText);
      throw new Error(`Gemini API returned status ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    let rawSvg = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up markdown block wrapping if present
    rawSvg = rawSvg.replace(/```xml|```svg|```/gi, "").trim();

    if (!rawSvg.startsWith("<svg") && rawSvg.includes("<svg")) {
      rawSvg = rawSvg.substring(rawSvg.indexOf("<svg"));
    }
    if (rawSvg.includes("</svg>")) {
      rawSvg = rawSvg.substring(0, rawSvg.indexOf("</svg>") + 6);
    }

    if (!rawSvg || !rawSvg.startsWith("<svg")) {
      throw new Error("Failed to generate a valid SVG avatar");
    }

    // Write temp SVG file
    const tempDir = path.resolve("./public/temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `avatar-${Date.now()}.svg`);
    fs.writeFileSync(tempFilePath, rawSvg);

    // Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(tempFilePath);
    if (!uploadResult?.url) {
      throw new Error("Failed to upload avatar to Cloudinary");
    }

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, { url: uploadResult.url }, "Avatar generated successfully"));
  } catch (error) {
    console.error("Error in generateAvatar:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new ApiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, null, error.message || "Failed to generate avatar"));
  }
});

export { registerUser, loginUser, logoutUser, refreshToken, getUser, googleAuthCallback, sendOtp, verifyOtp, sendRegistrationOtp, verifyRegistrationOtp, updateProfile, generateAvatar };
