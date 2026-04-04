import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cacheSet, cacheGet, cacheDel } from "../utils/redis.js";
import { sendOtpEmail } from "../utils/mailer.js";
import crypto from "crypto";

/**
 * User Service - Business logic for user operations
 * Separates business logic from controllers
 */
class UserService {
  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(user) {
    try {
      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
      }

      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to generate tokens"
      );
    }
  }

  /**
   * Register a new user
   */
  async registerUser(userData, avatarPath) {
    const { fullname, username, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "User with this email or username already exists"
      );
    }

    // Upload avatar to cloudinary
    let avatarUrl = "";
    if (avatarPath) {
      const avatar = await uploadOnCloudinary(avatarPath);
      avatarUrl = avatar?.url || "";
    }

    // Create user
    const user = await User.create({
      fullname,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      avatar: avatarUrl,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Get user without sensitive data
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return { user: createdUser, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async loginUser(usermail, password) {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: usermail.toLowerCase() }, { username: usermail.toLowerCase() }],
    });

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Get user without sensitive data
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return { user: loggedInUser, accessToken, refreshToken };
  }

  /**
   * Logout user
   */
  async logoutUser(userId) {
    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    return user;
  }

  /**
   * Google OAuth login/register
   */
  async googleLogin(profile) {
    // profile comes from passport-google-oauth20
    const { id: googleId, displayName: fullname, emails, photos } = profile;
    const email = emails?.[0]?.value;
    const avatar = photos?.[0]?.value || "";

    if (!email) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Google account has no email");
    }

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link googleId if they previously registered with email/password
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar) user.avatar = avatar;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Auto-generate a unique username from email
      const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }

      user = await User.create({ fullname, username, email, googleId, avatar });
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const safeUser = await User.findById(user._id).select("-password -refreshToken");
    return { user: safeUser, accessToken, refreshToken };
  }

  /**
   * Send OTP to email for login
   */
  async sendLoginOtp(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "No account found with this email");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    // Store OTP in Redis with 10-min TTL
    await cacheSet(`otp:${email.toLowerCase()}`, otp, 600);
    await sendOtpEmail(email, otp);
  }

  /**
   * Verify OTP and log in the user
   */
  async verifyLoginOtp(email, otp) {
    const key = `otp:${email.toLowerCase()}`;
    const storedOtp = await cacheGet(key);

    if (!storedOtp) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "OTP expired or not requested");
    }
    if (storedOtp !== otp) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid OTP");
    }

    // OTP is valid — delete it so it can't be reused
    await cacheDel(key);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const safeUser = await User.findById(user._id).select("-password -refreshToken");
    return { user: safeUser, accessToken, refreshToken };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    return user;
  }
}

export default new UserService();
