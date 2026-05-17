import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const skip = (page - 1) * limit;

    // 🔍 match stage (same as filter)
    const matchStage = {
        isPublished: true
    };

    if (query) {
        matchStage.title = { $regex: query, $options: "i" };
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    // 🔄 sort stage
    const sortStage = {};
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;

    const videos = await Video.aggregate([
        {
            $match: matchStage
        },
        {
            $sort: sortStage
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
        }
    ]);

    const totalVideos = await Video.countDocuments(matchStage);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                totalVideos,
                currentPage: Number(page),
                totalPages: Math.ceil(totalVideos / limit)
            },
            "Videos fetched successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"Video is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required")
    }
    const uploadVideo = await uploadOnCloudinary(videoLocalPath);
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!uploadVideo){
        throw new ApiError(401,"Video required")
    }
    const video = await Video.create({
        title,
        description,
        videoFile: uploadVideo.url,
        thumbnail: uploadThumbnail.url,
        duration: uploadVideo.duration || 0,
        owner: req.user?._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video Published Successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400,"Video ID is required")
    }
    const video = await Video.findById(videoId).populate(
        "owner",
        "fullname username avatar"
    )
    if(!video){
        throw new ApiError(400,"Can't get Video")
    }
    return res
    .status(201)
    .json(new ApiResponse(200,video,"Successfully get Video by ID"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400,"Video ID required")
    }
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400,"Can't Update video")
    }
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video");
    }
    const {title, description} = req.body

    if (title) video.title = title;
    if (description) video.description = description;
    const thumbnailLocalPath = req.file?.path;

    if (thumbnailLocalPath) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!uploadedThumbnail?.url) {
            throw new ApiError(500, "Error uploading thumbnail");
        }

        video.thumbnail = uploadedThumbnail.url;
    }

    await video.save();
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video details updated Successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 🔒 Ownership check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 🔒 ownership check
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    // 🔄 toggle logic
    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video is now ${video.isPublished ? "Published" : "Unpublished"}`
        )
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}