// src/api/api.js

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://youtube-app-u6gt.onrender.com";
const API_BASE_URL = (
  import.meta.env.BACKEND_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

// Common request helper
const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include", // important for cookies/JWT
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch (parseError) {
    if (!(parseError instanceof SyntaxError)) throw parseError;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
};

/* =========================
   AUTH APIs
========================= */

// Register User
export const registerUser = async (formData) => {
  return request("/user/register", {
    method: "POST",
    body: formData, // multipart/form-data
  });
};

// Login User
export const loginUser = async ({ emailOrUsername, password }) => {
  return request("/user/login", {
    method: "POST",
    body: JSON.stringify({
      password,
      ...(emailOrUsername.includes("@")
        ? { email: emailOrUsername }
        : { username: emailOrUsername }),
    }),
  });
};

// Logout User
export const logoutUser = async () => {
  return request("/user/logout", {
    method: "POST",
  });
};

// Get Current Logged In User
export const getCurrentUser = async () => {
  return request("/user/current-user", {
    method: "GET",
  });
};

export const changeCurrentPassword = async ({oldPassword,newPassword}) =>{
  return request("/user/change-password",{
    method:"POST",
    body: JSON.stringify({
      oldPassword,
      newPassword
    }),
  })
}

export const updateAccountDetails = async ({ fullname, email }) => {
  return request("/user/update-account", {
    method: "PUT",
    body: JSON.stringify({ fullname, email }),
  });
};

export const updateUserAvatar = async (avatar) => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  return request("/user/avatar", { method: "PATCH", body: formData });
};

export const updateUserCoverImage = async (coverImage) => {
  const formData = new FormData();
  formData.append("coverImage", coverImage);
  return request("/user/cover-image", { method: "PATCH", body: formData });
};

export const getChannelProfile = async (username) =>
  request(`/user/channel/${encodeURIComponent(username)}`);

export const getWatchHistory = async () => request("/user/history");

export const publishVideo = async (formData) => {
  return request("/video", {
    method: "POST",
    body: formData,
  });
};

export const getAllVideos = async ({
  query,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortType = "desc",
  userId,
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortType,
  });
  if (query) params.set("query", query);
  if (userId) params.set("userId", userId);

  return request(`/video?${params.toString()}`, {
    method: "GET",
  });
};

export const getVideoById = async (videoId) => {
  return request(`/video/${videoId}`, {
    method: "GET",
  });
};

export const updateVideo = async (videoId, { title, description, thumbnail }) => {
  const body = thumbnail ? new FormData() : JSON.stringify({ title, description });
  if (thumbnail) {
    body.append("title", title);
    body.append("description", description);
    body.append("thumbnail", thumbnail);
  }
  return request(`/video/${videoId}`, { method: "PATCH", body });
};

export const deleteVideo = async (videoId) =>
  request(`/video/${videoId}`, { method: "DELETE" });

export const toggleVideoPublished = async (videoId) =>
  request(`/video/toggle/publish/${videoId}`, { method: "PATCH" });

export const getVideoComments = async (videoId, page = 1, limit = 10) =>
  request(`/comment/${videoId}?page=${page}&limit=${limit}`);

export const addVideoComment = async (videoId, content) =>
  request(`/comment/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const updateVideoComment = async (commentId, newComment) =>
  request(`/comment/c/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ newComment }),
  });

export const deleteVideoComment = async (commentId) =>
  request(`/comment/c/${commentId}`, { method: "DELETE" });

export const toggleVideoLike = async (videoId) =>
  request(`/like/toggle/v/${videoId}`, { method: "POST" });

export const toggleCommentLike = async (commentId) =>
  request(`/like/toggle/c/${commentId}`, { method: "POST" });

export const toggleTweetLike = async (tweetId) =>
  request(`/like/toggle/t/${tweetId}`, { method: "POST" });

export const getLikedVideos = async () => request("/like/videos");

export const createPlaylist = async ({ name, description }) =>
  request("/playlist", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });

export const getUserPlaylists = async (userId) =>
  request(`/playlist/user/${userId}`);

export const getPlaylistById = async (playlistId) =>
  request(`/playlist/${playlistId}`);

export const updatePlaylist = async (playlistId, { name, description }) =>
  request(`/playlist/${playlistId}`, {
    method: "PATCH",
    body: JSON.stringify({ name, description }),
  });

export const deletePlaylist = async (playlistId) =>
  request(`/playlist/${playlistId}`, { method: "DELETE" });

export const addVideoToPlaylist = async (videoId, playlistId) =>
  request(`/playlist/add/${videoId}/${playlistId}`, { method: "PATCH" });

export const removeVideoFromPlaylist = async (videoId, playlistId) =>
  request(`/playlist/remove/${videoId}/${playlistId}`, { method: "PATCH" });

export const toggleSubscription = async (channelId) =>
  request(`/subscription/c/${channelId}`, { method: "POST" });

export const getSubscribedChannels = async (userId) =>
  request(`/subscription/c/${userId}`);

export const getChannelSubscribers = async (channelId) =>
  request(`/subscription/u/${channelId}`);

export const createTweet = async (content) =>
  request("/tweet", {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const getUserTweets = async (userId) =>
  request(`/tweet/user/${userId}`);

export const updateTweet = async (tweetId, content) =>
  request(`/tweet/${tweetId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });

export const deleteTweet = async (tweetId) =>
  request(`/tweet/${tweetId}`, { method: "DELETE" });

export const getChannelStats = async () => request("/dashboard/stats");

export const getChannelVideos = async (page = 1, limit = 10) =>
  request(`/dashboard/videos?page=${page}&limit=${limit}`);