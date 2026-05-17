// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
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
        <h2>Login</h2>

        <input
          className="auth-input"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn blue-btn" type="submit">
          Login
        </button>

        <p className="msg">{message}</p>

        <p>
          Don't have account?{" "}
          <Link to="/signup" className="auth-link">
            Signup
          </Link>
        </p>
      </form>
      
    </div>
    
  );
}