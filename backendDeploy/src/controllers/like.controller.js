import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user?._id

    if(isValidObjectId(videoId) === false){
        throw new ApiError(400, "Invalid video id")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    existingLike ? await Like.findByIdAndDelete(existingLike?._id) : await Like.create({
        video: videoId,
        likedBy: userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {isLiked: existingLike?false:true}, existingLike? "Removed like" : "Added like"))  
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id

    if(isValidObjectId(commentId) === false){
        throw new ApiError(400, "Invalid comment id")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })
    existingLike ? await Like.findByIdAndDelete(existingLike?._id) : await Like.create({
        comment: commentId,
        likedBy: userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {isLiked: existingLike? false : true}, existingLike? "Removed Comment Like": "Added Comment like"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id

    if(isValidObjectId(tweetId) === false){
        throw new ApiError(400, "Invalid tweet id")
    }

    const existingLike = await Like.findOne({
        tweet:tweetId,
        likedBy: userId
    })

    existingLike ? await Like.findByIdAndDelete(existingLike?._id) : await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {isLiked: existingLike?false:true}, existingLike? "Removed like" : "Added like"))  
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id
    const getAllLikedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(userId),
                video:{$exists: true}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"ownerDetails",
                        }
                    },
                    {
                        $project:{
                            refreshToken: 0,
                            password: 0,
                            createdAt: 0,
                            updatedAt: 0,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                "videoDetails": {$arrayElementAt: ["$videoDetails",0]}
            }
        }
    ])
    return res
    .status(200)
    .json( new ApiResponse(200, {likedVideos: getAllLikedVideos}, "Fetched liked videos"))    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}