// src/pages/Signup.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";
import "./Signup.css";

export default function Signup({ onSignup, message }) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("fullname", fullname);
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("avatar", avatar);

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    const success = await onSignup(formData);

    if (success) {
      navigate("/");
      toast("Signup Successful",{
        type:"success",
        autoClose: 1000
      })
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={submitHandler}>
        <h2>Signup</h2>

        <input
          className="auth-input"
          placeholder="Full Name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="avatar-input">Upload Avatar</label><br />
        <input
          className="auth-input"
          type="file"
          id="avatar-input"
          onChange={(e) => setAvatar(e.target.files[0])}
        />
        <label htmlFor="cover-image-input">Upload Cover Image (Optional)</label><br />
        <input
          className="auth-input"
          type="file"
          id="cover-image-input"
          onChange={(e) => setCoverImage(e.target.files[0])}
        />

        <button className="auth-btn green-btn">
          Signup
        </button>

        <p className="msg">{message}</p>

        <p>
          Already have account?{" "}
          <Link to="/" className="auth-link">
            Login
          </Link>
        </p>
      </form>
      <ToastContainer/>
    </div>
  );
}