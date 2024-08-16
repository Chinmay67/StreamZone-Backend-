import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getRandomVideos=asyncHandler(async(req,res)=>{
   try {
    const videos=await Video.find()
    .populate('owner','username')
    .sort({createdAt:-1})
    if(!videos){
        return res.status(200).json(new apiResponse(200,{},"No videos found"))
    }
    else{
        return res.status(200).json(new apiResponse(200,videos,"videos fetched successfully"))
    }
   } catch (error) {
    console.log(error)
    throw new apiError(200,"errors faced in fetching videos")
   }
})
const getTrendingVideos=asyncHandler(async(req,res)=>{
    try {
     const videos=await Video.find()
     .populate('owner','username')
     .sort({views:-1})
     if(!videos){
         return res.status(200).json(new apiResponse(200,{},"No videos found"))
     }
     else{
         return res.status(200).json(new apiResponse(200,videos,"videos fetched successfully"))
     }
    } catch (error) {
     console.log(error)
     throw new apiError(200,"errors faced in fetching videos")
    }
 })
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    const filter = {};
    if (query) {
      // You can customize this part based on your search requirements
      filter.$or = [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive title search
        { description: { $regex: query, $options: "i" } }, // Case-insensitive description search
      ];
    }
    if (userId) {
      filter.owner = userId;
    }
  
    // Construct the sort object based on sortBy and sortType parameters
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortType === "desc" ? -1 : 1;
    }
  
    // Fetch videos from the database based on filter, sort, and pagination
    const videos = await Video.find(filter)
      .sort(sort)
      .populate("owner") // Populate the 'owner' field to fetch full details of the owner
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
  
    // Get total count of videos matching the filter (for pagination)
    const totalCount = await Video.countDocuments(filter);
  
    // Construct response object with videos and pagination info
    const response = {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
      videos,
    };
  
    // Send back the response
    return res
      .status(200)
      .json(new apiResponse(200, response, "Videos fetched successfully"))


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(
        [title,description].some((field)=>
        field?.trim()==="")
    ){
        throw new apiError(400,"All fields are required")
    }
    const thumbnailPath=req.files?.thumbnail[0]?.path;
    const thumbnailFile=await uploadOnCloudinary(thumbnailPath);
    const videoLocalPath=req.files?.videoFile[0]?.path;

    const videoFile=await uploadOnCloudinary(videoLocalPath);
    if(!thumbnailFile){
        throw new apiError(400,"please upload a thumbnail file")
    }
    if(!videoFile){
        throw new apiError(400,"please upload a video file");

    }
    const video= await Video.create({
        title,
        description,
        videoFile:videoFile.secure_url,
        thumbnail:thumbnailFile.secure_url,
        duration:videoFile.duration,
        owner:req.user

        // videoPublicId:videoFile.public_id,
        // videoThumbnail:videoFile.thumbnail,
        // videoThumbnailPublicId:videoFile.thumbnail_public_id
    })
    const uploadedVideo=await Video.findById(video._id);
    if(!uploadedVideo){
        throw new apiError(400,"video not uploaded succesfully");
    }
    res.status(200)
    .send(
        new apiResponse(201,uploadedVideo,"video uploaded successfully")
    )
})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   
    // console.log("id=",videoId);
    //TODO: get video by id
    
    try {
        const video=await Video.findById(videoId)
        .populate('owner','username avatar');
        if(!video){
            throw new apiError(400,"video not found");
        }
        res.status(200)
        .json(
            new apiResponse(200,video,"video found")
        )
    
    } catch (error) {
        console.log(error)
        
    }

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title ,description}=req.body;
    if(!title || !description){
        throw new apiError(400,"all fields are required")

    }
    const video=await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description
        },
    )
    if(!video){
        throw new apiError(404,"video does not exist")
    }
    res.status(200)
    .json(201,video,"video updated successfully");
    //TODO: update video details like title, description, thumbnail

})

const updateVideoThumbnail=asyncHandler(async(req,res)=>{
    //TODO: update video thumbnail
    const {videoId}=req.params;
    const thumbnailPath=req.file?.path;
    if(!thumbnailPath){
        throw new apiError(404,"thumbnail missing")
    }
    const updatedThumbnail=await uploadOnCloudinary(thumbnailPath);
    const video=Video.findByIdAndUpdate(
        videoId,
        {
            thumbnail:updatedThumbnail.secure_url
        },
        {new:true}
    )
    if(!video){
        throw new apiError(404,"video does not exist");
    }
    res.status(201)
    .json(new apiResponse(201,video,"thumbnail updated successfully"));
    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video=await Video.findByIdAndDelete(videoId);
    if(!video){
        throw new apiError(404,"video does not exist")
    }
    //TODO: delete video
    res.status(200)
    .json(new apiResponse(200,{},"video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video=await Video.findByIdAndUpdate(
        videoId,
        {
            isPublished:!isPublished
        },
        
        {new:true}
    );

    if(!video){
        throw new apiError(400,"video does not exist");
    }
    res.status(201)
    .send(
        new apiResponse(201,video.isPublished,"toggled succesfully")
    )

})
const getAllUserVideos = asyncHandler(async (req, res) => {
    console.log(req.user)
    const userId = req.user?._id;
    // const userId=mongoose.Types.ObjectId(id)
    if (!userId) {
      return res.status(401).json(new apiResponse(401, null, "Unauthorized access"));
    }
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //     return res.status(400).json(new apiResponse(400, null, "Invalid user ID"));
    //   }
    
    try {
      const videos = await Video.find({ owner: userId , isPublished:true })
        .populate('owner', 'username')
        .sort({ createdAt: -1 });
  
      if (!videos || videos.length === 0) {
        return res.status(200).json(new apiResponse(200, [], "No Videos"));
      }
  
      return res.status(200).json(new apiResponse(200, videos, "Videos Retrieved Successfully"));
    } catch (error) {
      return res.status(500).json(new apiResponse(500, null, "Unable to fetch videos"));
    }
  });

  const getOtherUserVideos=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username){
        throw new apiError(404,'channel Not Found')
    }
    try {
        const user=await User.findOne({username})
        if(!user){
            throw new apiError(404,'channel Not Found')
        }
        const videos=await Video.find({owner:user._id, isPublished:true })
        .populate('owner','username')
        .sort({createdAt:-1})
        if(!videos||videos.length===0){
            return res.status(200).json(new apiResponse(200,[],"No Videos"))
        }
        return res.status(200).json(new apiResponse(200,videos,"Videos Retrieved Successfully"))
    } catch (error) {
        throw new apiError(500,"unable to fetch Videos")
    }
  })
  const incrementVideoView=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new apiError(404,"not a valid video")
    }
    try {
        const video=await Video.findByIdAndUpdate(
            videoId,
            {$inc:{views:1}},
            {new:true}
        )
       if(!video){
        throw new apiError(404,"video does not exist")
       }
       return res.status(200).json(new apiResponse(200, video,"view updated successfully"))
    } catch (error) {
        throw new apiError(500, "error updating views")
    }
  })

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoThumbnail,
    getRandomVideos,
    getAllUserVideos,
    getOtherUserVideos,
    incrementVideoView,
    getTrendingVideos
}