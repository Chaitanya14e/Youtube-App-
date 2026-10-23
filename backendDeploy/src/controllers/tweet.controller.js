import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
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
    const tweet = await Tweet.aggregate([
        {$match: {owner: new mongoose.Types.ObjectId(userId)}},
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
                pipeline: [{$project: {likedBy: 1}}]
            }
        },
        {
            $addFields: {
                likeCount: {$size: "$likes"},
                isLiked: {
                    $in: [new mongoose.Types.ObjectId(req.user?._id), "$likes.likedBy"]
                }
            }
        },
        {$project: {likes: 0}},
        {$sort: {createdAt: -1}}
    ])
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
    const existingTweet = await Tweet.findById(tweetId)
    if(!existingTweet){
        throw new ApiError(404,"Tweet not found")
    }
    if (existingTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }
    existingTweet.content = trimmedContent;
    const tweet = await existingTweet.save();
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
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }
    await tweet.deleteOne();
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