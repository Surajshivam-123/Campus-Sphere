import {User} from '../models/user.model.js'
import asyncHandler from '../utils/AsyncHandler.js'
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
        return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
})