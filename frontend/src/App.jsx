import { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  changeCurrentPassword,
} from "./lib/api";

import Login from "../components/Login/Login";
import Signup from "../components/Signup/Signup";
import Home from "../components/Home/Home";
import Profile from "../components/Profile/Profile";
import ChangePassword from "../components/ChangePassword/ChangePassword";
import UploadVideo from "../components/UploadVideo/UploadVideo";
import VideoPlayer from "../components/VideoPlayer/VideoPlayer";
import { toast, ToastContainer } from "react-toastify";

export default function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  // LOGIN
  const handleLogin = async (data) => {
  try {
    await loginUser(data);

    const res = await getCurrentUser();

    setUser(res.data);
    setMessage("");

    return true; // important
  } catch (error) {
    setMessage(error.message);
    return false; // important
  }
};

  // SIGNUP
  const handleSignup = async (formData) => {
    try {
      await registerUser(formData);
      setMessage("Signup successful");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    toast("Logout successful",{
      type:"success",
      autoClose: 1000
    });
    await logoutUser();
    setUser(null);
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (data) => {
    try {
      await changeCurrentPassword(data);
      setMessage("Password changed successfully");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const PrivateRoute = (element) => {
    return user ? element : <Navigate to="/" />;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Login
          onLogin={handleLogin}
          message={message}
        />
      ),
    },
    {
      path: "/signup",
      element: (
        <Signup
          onSignup={handleSignup}
          message={message}
        />
      ),
    },
    {
      path: "/home",
      element: PrivateRoute(
        <Home
          user={user}
          onLogout={handleLogout}
        />
      ),
    },
    {
      path: "/profile",
      element: PrivateRoute(
        <Profile user={user} />
      ),
    },
    {
      path: "/change-password",
      element: PrivateRoute(
        <ChangePassword
          onSubmit={handleChangePassword}
          message={message}
        />
      ),
    },
    {
      path: "/upload-video",
      element: PrivateRoute(
        <UploadVideo
          message={message}
        />
      )
    },
    {
      path: "/video/:videoId",
      element: (
        
          <VideoPlayer />
        
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
      autoClose={5000}
      />
    </>
  );
}