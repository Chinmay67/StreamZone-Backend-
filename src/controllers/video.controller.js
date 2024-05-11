import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const videos=Video.find({owner:req.user?._id})
    const totalVideos=await videos.countDocuments();
    // const totalPages=Math.ceil(totalVideos/limit);
    // const hasNextPage=page<totalPages
    // const videosData=await videos
    // .sort({createdAt:sortType})
    // .limit(limit * 1)
    // .skip((page - 1) * limit)
    // .exec(); 
    // .sort({createdAt:sortType})
    
    res.status(200).json(new apiResponse(200,videos,"all videos fetched"))


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
    //TODO: get video by id
    
    const video=await Video.findById(videoId);
    if(!video){
        throw new apiError(400,"video not found");
    }
    res.status(200)
    .json(
        new apiResponse(200,video,"video found")
    )


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

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoThumbnail
}