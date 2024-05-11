import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const comments=Comment.find({video:videoId})
    // const totalComments=await Comment.countDocuments({video:videoId})
    // const totalPages=Math.ceil(totalComments/limit)
    // if(page>totalPages){
    //     throw new apiError(404,"page not found")
    // }
    // const skip=(page-1)*limit
    // const commentsData=await comments.skip(skip).limit(limit).populate("user")
    res.status(200).json(apiResponse(200,comments,"comments fetched"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    const newComment=new Comment({
        video: videoId,
        content,
        user: req.user._id
    })
    await newComment.save()
    res.status(201).json(apiResponse(201,newComment,"comment added to video"))
    
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