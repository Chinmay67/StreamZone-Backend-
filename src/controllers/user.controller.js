import {asyncHandler} from '../utils/asyncHandler.js'
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from '../utils/apiResponse.js'
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        

        const refreshToken=user.generateRefreshToken()
        
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new apiError(500,"something went wrong while generating token")
        
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    // console.log("from backend",req.body);
   const {fullname,email,username,password}=req.body
    // console.log("email:",email)
//    if(fullname===""){
//     throw new apiError(400,"Fullname is required")
//    }
    if(
        [fullname,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new apiError(400,"All fields are required")
    }
    const existedUser= await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new apiError(409,"User with similar email or username already exists")

    }
    console.log(req.files);
    const avatarLocalPath=req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) 
    && req.files.coverImage.length>0)
    {
        coverImageLocalPath=req.files.coverImage[0].path
    }
    
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new apiError(400,"avatar file is required")
    }
    const user=await User.create({
        fullname,
        avatar : avatar.url,
        coverImage: coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()  

    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken")
    if(!createdUser){
        throw new apiError(500,"something went wrong while registering the user")
    }
    
    return res.status(201).json(
        new apiResponse(200,createdUser,"User registered successfully")
    )
    
})

const loginUser=asyncHandler(async (req,res)=>{
    const {email,username,password}=req.body
    
    if(!(username || email)){
        throw new apiError(400,"username or email are required")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new apiError(404,"user does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401,"invalid credentials");
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    
    
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(    
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User loggin succesfully"
        )
    )
})  

// const findUserById=asyncHandler(async(req,res)=>{
//     const Id=req.body.owner
//     if(!Id){
//         throw new apiError(400,"id is required")
//     }
    
//     try {
//         const channelName=await User.findById(Id).select("username")
//         return res.status(200).json(new apiResponse(200,{channelName},"channelName fetched successfully"))
//     } catch (error) {
//         console.log("error fetching channel", error)
//     }
// })
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:1
            }
        },
        {
            new:true
        },
        
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefeshToken=req.cookies.refreshToken||req.body.refreshToken
    if(!incomingRefeshToken){
        throw new apiError(401,"unaothorised request")
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefeshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(500,"invalid refresh token")
        }
    
        if(incomingRefeshToken!==user?.refreshToken){
            throw new apiError(401,"refresh token is expired or lost")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new apiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message||"Invalid Refresh Token" )
    }

})


const changeCurrentPassword=asyncHandler(async(req,res)=> {
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid old password")

        
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})


    return res.status(200)
    .json(
        new apiResponse(200,{},"Password changed successfully")
    )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    try {
        return res.status(200)
        .json(new apiResponse(200,req.user,"user fetched successfully"))
    } catch (error) {
        throw new apiError(404,"cannot get details")
    }
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body

    if(!fullname || !email){
        throw new apiError(400,"All fields are required")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname:fullname,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200).json(new apiResponse(200,user,'Account details uploaded successfully'))


})


const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file is missing")

        
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new apiError(400,"Error while uploading on avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new apiResponse(200,user,"avatar changed successfully"))
})
const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new apiError(400,"Alvatar file is missing")

        
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new apiError(400,"Error while uploading on avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new apiResponse(200,user,"coverImage changed successfully"))
})


const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params

    if(!username?.trim()){
        throw new apiError(400,"username is missing")
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()

            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscibedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelsSubscibedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new apiError(404,"Channel does not exists")

    }

    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0],"user Channel fteched succesfully")
    )
})

const getOtherChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username?.trim()){
        throw new apiError(400,"username is missing")
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()

            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
       
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
               
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                // channelsSubscibedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                // email:1
            }
        }
    ])
    if(!channel?.length){
        throw new apiError(404,"Channel does not exists")

    }

    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0],"user Channel fteched succesfully")
    )


})
const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                    $lookup :{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
                    
                ]
            }
        }
    ])

    return res.status(200)
    .status(200)
    .json(
        new apiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched succesfully"
        )
    )
})


export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getCurrentUser,
    changeCurrentPassword,
    getUserChannelProfile,
    getWatchHistory,
    getOtherChannelProfile
    
}