import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"
import {Like} from "../models/like.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: { createdAt: -1 } // latest first
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { commentId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$comment", "$$commentId"] }
                        }
                    },
                    { $project: { likedBy: 1 } }
                ],
                as: "likes"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                isLiked: {
                    $in: [new mongoose.Types.ObjectId(req.user?._id), "$likes.likedBy"]
                }
            }
        },
        {
            $project: { likes: 0 }
        }
    ]);

    const totalComments = await Comment.countDocuments({
        video: videoId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                totalComments,
                currentPage: Number(page),
                totalPages: Math.ceil(totalComments / limit)
            },
            "Comments fetched successfully"
        )
    );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params
    if(!content?.trim()){
        throw new ApiError(400,"Comment can't be empty")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const comment = await Comment.create({
        content:content,
        video:videoId,
        owner:req.user?._id
    })
    if(!comment){
        throw new ApiError(400,"Error while adding Comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newComment} = req.body
    if(!mongoose.isValidObjectId(commentId) || !commentId){ // this commentId check is redudant as, if the comment doesn't exist, the endpoint won't be hit at all 
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment dosen't exists.")
    }

    if (!newComment?.trim()) {
        throw new ApiError(400, "Comment can't be empty")
    }

    //we also need to check if the comment being updated was writtend by the same user or not- else any user can update any comment
    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to update this comment")
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {content:newComment.trim()},
        {new:true}
    )
    if(!updatedComment){
        throw new ApiError(400,"Error while updating comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedComment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
     const {commentId} = req.params;
    

    if(!mongoose.isValidObjectId(commentId) || !commentId){
        throw new ApiError(400, "Invalid comment id")
    }
    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    if(comment?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this comment")
    }
    
    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id
    })

    if(!deletedComment){
        throw new ApiError(500, "Error while deleting comment, Please try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }