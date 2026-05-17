// src/components/Home/Home.jsx

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";

import { getAllVideos } from "../../src/lib/api";

import "./Home.css";

export default function Home({ user, onLogout }) {

  const [showMenu, setShowMenu] = useState(false);

  const [videos, setVideos] = useState([]);

  const [search, setSearch] = useState("");

  /* FETCH VIDEOS */

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {

      const res = await getAllVideos();

      setVideos(res.data.videos);

    } catch (error) {
      console.log(error);
    }
  };

  /* SEARCH */

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-layout">

      <Sidebar />

      <div className="home-content">

        {/* HEADER */}

        <div className="home-header">

          {/* SEARCH BAR */}

          <div className="search-box">

            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button>🔍</button>

          </div>

          {/* UPLOAD BUTTON */}

          <div className="video-btn">

            <NavLink
              to="/upload-video"
              className="video-link"
            >
              + Upload a Video
            </NavLink>

          </div>

          {/* USER */}

          <div className="user-section">

            <img
              src={
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="user"
              className="user-avatar"
              onClick={() =>
                setShowMenu(!showMenu)
              }
            />

            {showMenu && (

              <div className="dropdown-menu">

                <NavLink
                  to="/profile"
                  className="drop-link"
                >
                  My Profile
                </NavLink>

                <NavLink
                  to="/change-password"
                  className="drop-link"
                >
                  Change Password
                </NavLink>

                <p onClick={onLogout}>
                  Logout
                </p>

              </div>

            )}

          </div>
        </div>

        {/* VIDEO SECTION */}

        <div className="video-grid">

          {filteredVideos.map((video) => (

            <NavLink
              to={`/video/${video._id}`}
              className="video-card"
            >

              <img
                src={video.thumbnail}
                alt={video.title}
                className="video-thumb"
              />

              <div className="video-info">

                <h3 className="video-title">{video.title}</h3>

                <p className="video-description">{video.description}</p>

              </div>

            </NavLink>

          ))}

        </div>

      </div>
    </div>
  );
}