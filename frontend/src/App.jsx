import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
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
import Studio from "../components/Studio/Studio";
import Library from "../components/Library/Library";
import Channel from "../components/Channel/Channel";
import { toast, ToastContainer } from "react-toastify";
import "./App.css";

function ProtectedRoute({ user, authLoading, children }) {
  if (authLoading) {
    return (
      <div className="app-loading" role="status">
        Loading your account…
      </div>
    );
  }
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((response) => {
        if (isMounted) setUser(response.data);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setAuthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // LOGIN
  const handleLogin = async (data) => {
    try {
      await loginUser(data);
      const response = await getCurrentUser();
      if (!response.data) {
        throw new Error("Login succeeded, but the session cookie was not saved.");
      }
      setUser(response.data);
      setMessage("");
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  };

  // SIGNUP
  const handleSignup = async (formData) => {
    try {
      await registerUser(formData);
      setMessage("Signup successful");
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.success("Signed out successfully", { autoClose: 1000 });
    } catch (error) {
      toast.error(error.message || "Unable to sign out");
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (data) => {
    try {
      await changeCurrentPassword(data);
      setMessage("Password changed successfully");
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Login onLogin={handleLogin} message={message} />}
          />
          <Route
            path="/signup"
            element={<Signup onSignup={handleSignup} message={message} />}
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <Home user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <Profile
                  user={user}
                  onUserUpdated={setUser}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <Studio user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <Library user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channel/:username"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <Channel user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <ChangePassword
                  onSubmit={handleChangePassword}
                  message={message}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-video"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <UploadVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:videoId"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <VideoPlayer user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        autoClose={5000}
      />
    </>
  );
}