// src/pages/Profile.jsx

import { NavLink } from "react-router-dom";
import "./Profile.css";

export default function Profile({ user }) {
  return (
    <div className="profile-container">
      <div className="profile-card">

        <img
          src={
            user?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="avatar"
          className="profile-avatar"
        />

        <h2>{user?.fullname}</h2>
        <p>@{user?.username}</p>
        <p>{user?.email}</p>

        <NavLink to="/home">
          <button className="profile-btn">
            Back
          </button>
        </NavLink>

      </div>
    </div>
  );
}