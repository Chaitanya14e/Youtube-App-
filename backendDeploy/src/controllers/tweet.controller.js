import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"Content is required")
    }
    const trimmedContent = content?.trim()
    if(trimmedContent.length === 0){
        throw new ApiError(400,"Content is required")
    }
    const tweet = await Tweet.create({
        content:trimmedContent,
        owner:req.user?._id
    })
    return res
    .status(201)
    .json(new ApiResponse(200,tweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const tweet = await Tweet.find({
        owner:userId
    }).sort({createdAt:-1})
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
    if(!content){
        throw new ApiError(400,"Content is required")
    }
    const trimmedContent = content?.trim()
    if(trimmedContent.length === 0){
        throw new ApiError(400,"Content is required")
    }
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {content:trimmedContent},
        {new:true}
    )
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }   
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,null,"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}