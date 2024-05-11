import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new apiError(400,"Content is required")
    }
    const newTweet= new Tweet.create({
        user: req.user._id,
        content,
    })
    newTweet.save()
    res.status(201).json(new apiResponse(201,newTweet,"tweet created"))


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    const tweets=await Tweet.find({owner:id})
    res.status(200).json(new apiResponse(200,tweets,"tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content}=req.body
    if(!content){
        throw new apiError(404,"all fields are required")
    }
    const updatedTweet= await Tweet.findByIdAndUpdate(tweetId,{
        content
    })
    res.status(200).json(new apiResponse(200,updatedTweet,"tweet updated"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    const deletedTweet= await Tweet.findByIdAndDelete(tweetId)
    res.status(200).json(new apiResponse(200,{},"tweet deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}