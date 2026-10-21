// src/pages/Signup.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import { toast } from "react-toastify";
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
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <Clapperboard size={18} fill="currentColor" />
          </span>
          FunTube
        </div>
        <h2>Create your account</h2>
        <p className="auth-subtitle">Join in and share what you love to watch.</p>

        <input
          className="auth-input"
          name="fullname"
          autoComplete="name"
          aria-label="Full name"
          placeholder="Full Name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="email"
          name="email"
          autoComplete="email"
          aria-label="Email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="auth-input"
          name="username"
          autoComplete="username"
          aria-label="Username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          name="password"
          autoComplete="new-password"
          aria-label="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="avatar-input">Upload Avatar</label><br />
        <input
          className="auth-input"
          type="file"
          id="avatar-input"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          required
        />
        <label htmlFor="cover-image-input">Upload Cover Image (Optional)</label><br />
        <input
          className="auth-input"
          type="file"
          id="cover-image-input"
          accept="image/*"
          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
        />

        <button className="auth-btn green-btn" type="submit">
          Create account
        </button>

        {message && <p className="msg">{message}</p>}

        <p>
          Already have an account?{" "}
          <Link to="/" className="auth-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}