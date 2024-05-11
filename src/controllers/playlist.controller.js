import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if(!name && !description){
        throw new apiError(404,"please enter all the fields")
    }
    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user._id
    })
    res.status(201).json(
        new apiResponse(201,playlist,"playlist created")
    )
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({owner: userId})
    if(playlists.length===0){
        res.status(200)
        .json(new apiResponse(201,{},"create a playlist"))
    }
    res.status(200).json(new apiResponse(200,playlists,"playlists fetched"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(404,{},"playlist does not exist");
    }
    res.status(200).json(new apiResponse(200,playlist,"playlist fetched"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    res.status(201).json(new apiResponse(201,playlist,"playlist updated"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true

        }
    )
    res.status(200).json(new apiResponse(200,playlist,"video deleted successfully"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const deletedPlaylist=await Playlist.findByIdAndDelete(playlistId)
    res.status(201).json(new apiResponse(201,{},"playlist updated"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!name || !description){
        throw new apiError(404,"please enter all the fields")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        name,
        description
    })
    await updatedPlaylist.save()
    res.status(201).json(new apiResponse(201,updatedPlaylist,"playlist updated"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}