import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const like= await Like.findOne({videoId: videoId, likedBy: req.user._id})
    if(like){
        await Like.findByIdAndDelete(like._id)
        return res.status(201).json(new apiResponse(201,{},"like deleted"))
    }
    else{
        const newLike = new Like({
            videoId: videoId,
            likedBy: req.user._id
        })
        await newLike.save()
        return res.status(201).json(new apiResponse(201,{},"like added"))
    }
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const like= await Like.findOne({commentId: commentId, likedBy: req.user._id})
    if(like){
        await Like.findByIdAndDelete(like._id)
        return res.status(201).json(new apiResponse(201,{},"like deleted"))
    }
    else{
        const newLike=new Like({
            commentId: commentId,
            likedBy: req.user._id
        })
        await newLike.save()    
        return res.status(201).json(new apiResponse(201,newLike,"like added"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const like = await Like.findOne({tweetId: tweetId, likedBy: req.user._id})
    if(like){
        await Like.findByIdAndDelete(like._id)
        return res.status(201).json(new apiResponse(201,{},"like deleted"))
    }
    else{
        const newLike=new Like({
            tweetId: tweetId,
            likedBy: req.user._id
        })
        await newLike.save()
        return res.status(201).json(new apiResponse(201,newLike,"like added"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:req.user?._id
            },
           
        },
        {
            $project:{
                video:1,
                likedBy:1
            }
        }
    ])

    if(!likedVideos.length){
        res.status(200).json(new apiResponse(200,likedVideos,"liked videos fetched successfully"))
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}