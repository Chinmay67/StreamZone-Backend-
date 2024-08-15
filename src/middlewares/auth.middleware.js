import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT= asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new apiError(401,"Unauthorised request")
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user =await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new apiError(401,"Invald Access Token")
        }
        req.user=user
        next()
    } catch (error) {
        throw new apiError(401,error?.message ||"Inavlid access Token")
    }
})

export const checkToken=asyncHandler(async(req,res)=>{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        return res.status(200).json(new apiResponse(200,false,''))
    }
    else{
        return res.status(200).json(new apiResponse(200,true,''))
    }
})