import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscriptionStatus=await Subscription.find({channel:channelId , subscriber:req.body?._id})
    if(subscriptionStatus){
        await Subscription.findByIdAndDelete(subscriptionStatus._id)
        res.status(200).json(new apiResponse(200,{},"unsubscribed"))
    }
    else{
        const newSubscription = new Subscription({
            channel:channelId,
            subscriber:req.body?._id
        })
        await newSubscription.save()
        res.status(200).json(new apiResponse(200,newSubscription,"subscribed"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.find({channel:channelId})
    
    res.status(200).json(new apiResponse(200,subscribers,"subscribers fetched"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscribedChannels = await Subscription.find({ subscriber: subscriberId })
    res.status(200).json(new apiResponse(200,subscribedChannels,"subscribed channels fetched"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}