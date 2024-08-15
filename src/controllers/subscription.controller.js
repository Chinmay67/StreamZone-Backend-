import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    console.log("paramse",channelId)
    console.log(req.user._id)
    // TODO: toggle subscription
   try {
     const subscriptionStatus=await Subscription.find({channel:channelId , subscriber:req.user?._id})
     console.log(subscriptionStatus)
     if(subscriptionStatus.length>0){
         try {
            await Subscription.findByIdAndDelete(subscriptionStatus[0]._id)
            res.status(200).json(new apiResponse(200,{},"unsubscribed"))
         } catch (error) {
            throw new apiError(404,"error unsubscribing")
         }
     }
     else{
         const newSubscription = new Subscription({
             channel:channelId,
             subscriber:req.user?._id
         })
         await newSubscription.save()
         res.status(200).json(new apiResponse(200,newSubscription,"subscribed"))
     }
   } catch (error) {
    console.log(error)
    throw new apiError(500, "unable fetch subscription status")
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

const checkUserSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params
    
    const subscriberId=req.user._id
    console.log(channelId);
    console.log(subscriberId)
   try {
     const subscriptionStatus=await Subscription.find({channel:channelId,subscriber:subscriberId})
    //  console.log(subscriptionStatus)
     if(subscriptionStatus.length>0){
         res.status(200).json(new apiResponse(200,true,"subscription status fetched"))
     }
     else{
         res.status(200).json(new apiResponse(200,false,"subscription status fetched"))
     }
   } catch (error) {
    console.log(error)
    throw new apiError(500, "unable to fetch subscription status")
   }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    checkUserSubscription
}