import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js"
import {Video} from "../models/video.model.js"
import { apiError } from "../utils/apiError.js";

const getChannelStats=asyncHandler(async (req, res) => {
    const userId=req.user._id
    const NumberOfVideos=await Video.find({owner:userId}).countDocuments();
    const subscriberCount=await Subscription.find({channel:userId}).countDocuments()

   try {
     if(NumberOfVideos=== 0){
         const totalViews=0
         return res.status(200).json(new apiResponse(200, {NumberOfVideos,totalViews,subscriberCount},"stats fetched successfully"))
     } 
     else{
         const totalViews=await Video.aggregate([
             {
                 $match:{
                     owner:userId
                 }
             },
                 {
                     $group:{
                         _id:null,
                         totalViews:{$sum:"$views"},
                     }
                 }
         ])
         return res.status(200).json(new apiResponse(200,{NumberOfVideos,totalViews,subscriberCount},"stats fetched successfully"))
 
     }
   } catch (error) {
    throw new apiError(500,"error fetching stats")
   }

})


export{
    getChannelStats
}
