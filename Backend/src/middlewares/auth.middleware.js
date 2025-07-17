import {User} from '../models/user.models.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/AsyncHandler.js'
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"Token is not available");
        }
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decoded._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Unauthorized")
        }
        req.user=user;
        next()
    } catch (error) {
        console.log("Error while verifyJWT",error)
    
    }
})