import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    const playList = await Playlist.create({
        name:name,
        description:description,
        videos:[],
        owner:req.user?._id
    })
    if(!playList){
        throw new ApiError(500, "Failed to create playlist")
    }
    return res
    .status(201)
    .json(new ApiResponse(200, playList,"Playlist created successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const Playlists = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $addFields:{
                totalVideos: {$size:"$videos"}
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200, Playlists,"User playlists fetched successfully"))    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playList = await Playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos", // Playlist -> Video
                localField:"videos",// videos array in playlist
                foreignField:"_id",
                as:"videoDetails",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"ownerDetails",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            ownerDetails:{$first:"$ownerDetails"}
                        }
                    }
                ]
            }
        }
    ])
    if(playList.length === 0){
        throw new ApiError(404, "Playlist doesn't exist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, playList,"Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!await Video.exists({_id: videoId})){
        throw new ApiError(400,"Video doesn't Exists, Sorry.")
    }

    const updatedPlaylist= await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $addToSet:{
                videos:videoId
            }
        },
        {
            new:true
        }
    )


    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Successfully Added video to the playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!await Video.exists({_id: videoId})){
        throw new ApiError(400,"Video doesn't Exists, Sorry.")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId, 
            owner: req.user?._id 
        },
        {
            $pull: { videos: videoId }
        },
        { new: true }
    )
    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Successfully Added video to the playlist"))
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const deletePlaylist = await Playlist.findOneAndDelete({
        _id:playlistId,
        owner:req.user?._id
    })
    if(!deletePlaylist){
        throw new ApiError(404, "Playlist not found or unauthorized")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, deletePlaylist,"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!name || name.trim() === ""){
        throw new ApiError(400,"Name is required")
    }
    const updateDetails= {
        name: name.trim()
    }
   //so that if no description is recieved, previous description isn't overwritten
    if( description !== undefined){  
        updateDetails.description= description.trim()
    }
    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner:req.user?._id
        },
        {
            $set:updateDetails,
        }, 
        {
            new:true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(404,"Couldn't find Playlist or unauthorized req")
    }
    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Successfully updated Playlist"))
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