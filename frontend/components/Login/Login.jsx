// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login({ onLogin, message }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    const success = await onLogin({
      emailOrUsername,
      password,
    });

    if (success) {
      toast("Login successful",{
        type:"success",
        autoClose: 1000,
      });
      navigate("/home");
    }else{
      toast("Login failed",{
        type:"error",
        autoClose: 1000
      })
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={submitHandler}>
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <Clapperboard size={18} fill="currentColor" />
          </span>
          FunTube
        </div>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to find your next favorite video.</p>

        <input
          className="auth-input"
          type="text"
          name="emailOrUsername"
          autoComplete="username"
          aria-label="Email or username"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          name="password"
          autoComplete="current-password"
          aria-label="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-btn blue-btn" type="submit">
          Sign in
        </button>

        {message && <p className="msg">{message}</p>}

        <p>
          New to FunTube?{" "}
          <Link to="/signup" className="auth-link">
            Create an account
          </Link>
        </p>
      </form>
      
    </div>
    
  );
}