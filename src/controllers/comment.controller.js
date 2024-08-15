import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    // console.log("id is ",videoId)
    // const {page = 1, limit = 10} = req.query
   try {
     const comments=await Comment.find({video:videoId})
     .populate('owner','avatar username')
     .sort({createdAt:-1})
    //  console.log(comments)
     // const totalComments=await Comment.countDocuments({video:videoId})
     // const totalPages=Math.ceil(totalComments/limit)
     // if(page>totalPages){
     //     throw new apiError(404,"page not found")
     // }
     // const skip=(page-1)*limit
     // const commentsData=await comments.skip(skip).limit(limit).populate("user")
     res.status(200).json(new apiResponse(200,comments,"comments fetched"))
   } catch (error) {
    console.log(error)
    throw new apiError(404,"unable to fetch comments ")
   }
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    console.log("content ",content)
    console.log("videoId ",videoId)
    if(!content ||content===''){
        throw new apiError(400,"content is required")
    }
    const newComment=new Comment({
        video: videoId,
        content,
        owner: req.user._id
    })
    await newComment.save()
    if(!newComment){
        throw new apiError(404,"unable to add comment")
    }
    res.status(201).json(new apiResponse(201,newComment,"comment added to video"))

    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const updatedComment=await Comment.findByIdAndUpdate(commentId,{
        content: req.body.content
    })
    if(!updatedComment){
        throw new apiError(404,"comment not found")
    }
    res.status(200).json(apiResponse(200,updatedComment,"comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    const deletedComment=await Comment.findByIdAndDelete(commentId)
    res.status(200).json(apiResponse(200,{},"comment deleted"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }