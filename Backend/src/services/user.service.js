import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * User Service - Business logic for user operations
 * Separates business logic from controllers
 */
class UserService {
  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(userId) {
    try {
      const user = await User.findById(userId);
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
    const { accessToken, refreshToken } = await this.generateTokens(user._id);

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
    const { accessToken, refreshToken } = await this.generateTokens(user._id);

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
      await this.generateTokens(user._id);

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
