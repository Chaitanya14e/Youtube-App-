// src/api/api.js

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://youtube-app-u6gt.onrender.com";
const API_BASE_URL = (
  import.meta.env.VITE_BACKEND_URL || DEFAULT_API_BASE_URL
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
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortType,
  });
  if (query) params.set("query", query);

  return request(`/video?${params.toString()}`, {
    method: "GET",
  });
};

export const getVideoById = async (videoId) => {
  return request(`/video/${videoId}`, {
    method: "GET",
  });
};