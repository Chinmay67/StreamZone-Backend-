import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// const toggleVideoLike = asyncHandler(async (req, res) => {
//     const {videoId} = req.params
//     const {likeType}=req.body
//     //TODO: toggle like on video
//    try {
//      const like= await Like.findOne({videoId: videoId, likedBy: req.user._id, likeType:likeType})
//      if(like){
//          await Like.findByIdAndDelete(like._id)
//          return res.status(201).json(new apiResponse(201,{},"like deleted"))
//      }
//      else{
//          const prevLike= await Like.findOne({videoId:videoId,likedBy:req.user._id})
//          if(prevLike){
//              await Like.findByIdAndUpdate(prevLike._id,{$set:{likeType:likeType}})
//          }
//          else{
//              const newLike = new Like({
//                  videoId: videoId,
//                  likedBy: req.user._id,
//                  likeType: likeType
//              })
//              await newLike.save()
//              return res.status(201).json(new apiResponse(201,{},"like added"))
//          }
//      }
//    } catch (error) {

//     console.log(error)
//     throw new apiError(404,error)
//    }
    
// })
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { likeType } = req.body;
    // const video= new mongoose.Types.ObjectId(videoId)
    try {
        // Check if a like/dislike by the user already exists for this video
        const existingLike = await Like.findOne({ video: videoId, likedBy: req.user._id });
        console.log(req.user._id)
        console.log(videoId)
        // console.log(video)
        console.log("like" ,existingLike)
        if (existingLike) {
            if (existingLike.likeType === likeType) {
                // If the existing like is of the same type, remove it (toggle off)
                await Like.findByIdAndDelete(existingLike._id);
                return res.status(201).json(new apiResponse(201, {}, "like removed"));
            } else {
                // If the existing like is of a different type, update it (toggle to opposite)
                existingLike.likeType = likeType;
                await existingLike.save();
                return res.status(201).json(new apiResponse(201, existingLike, "like type updated"));
            }
        } else {
            // If no like exists, create a new one
            const newLike = new Like({
                video: videoId,
                likedBy: req.user._id,
                likeType: likeType
            });
            await newLike.save();
            return res.status(201).json(new apiResponse(201, newLike, "like added"));
        }
    } catch (error) {
        console.log(error);
        throw new apiError(404, error);
    }
});

const CheckVideoLike=asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    //TODO: toggle like on video
    try {
        const like = await Like.findOne({video: videoId, likedBy: req.user._id})
        if(like){
            return res.status(201).json(new apiResponse(201,like,"fetched successfully"))
        }
        else{
            return res.status(201).json(new apiResponse(201,{},"no like found"))
        }
    } catch (error) {
        throw new apiError(404,`error ${error}`)
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId}=req.params
    const {likeType}=req.body
    //TODO: toggle like on comment
    try {
        const existingLike= await Like.findOne({comment: commentId, likedBy: req.user._id})
        if(existingLike){
            if(existingLike.likeType===likeType){
                await Like.findByIdAndDelete(existingLike._id)
                return res.status(201).json(new apiResponse(201,{},"like deleted"))
            }
            else{
                existingLike.likeType = likeType;
                await existingLike.save();
                return res.status(201).json(new apiResponse(201, existingLike, "like type updated"));
            }
           
        }
        else{
        
            const newLike=new Like({
                comment: commentId,
                likedBy: req.user._id,
                likeType:likeType
            })
            await newLike.save()   
             
            return res.status(201).json(new apiResponse(201,newLike,"like added"))
           
        }
    } catch (error) {
        console.log(error)
        throw new apiError(404,error)
    }

})
const checkCommentLike=asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    try {
        const like= await Like.findOne({comment: commentId, likedBy: req.user._id})
        if(like){
            return res.status(201).json(new apiResponse(201,like,"liked"))
        }
        else{
            return res.status(201).json(new apiResponse(201,{},"no like found"))
        }
    } catch (error) {
        throw new apiError(404,`error ${error}`)
    }
    
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const like = await Like.findOne({tweet: tweetId, likedBy: req.user._id})
    if(like){
        await Like.findByIdAndDelete(like._id)
        return res.status(201).json(new apiResponse(201,{},"like deleted"))
    }
    else{
        const newLike=new Like({
            tweet: tweetId,
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
    getLikedVideos,
    CheckVideoLike,
    checkCommentLike
}