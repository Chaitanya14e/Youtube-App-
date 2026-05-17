// src/components/VideoPlayer/VideoPlayer.jsx

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { getVideoById } from "../../src/lib/api";

import {NavLink} from "react-router-dom";

import "./VideoPlayer.css";

function VideoPlayer() {

  const { videoId } = useParams();

  const [video, setVideo] = useState(null);

  useEffect(() => {
    fetchVideo();
  });

  const fetchVideo = async () => {
    try {

      const res = await getVideoById(videoId);

      setVideo(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  if (!video) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="player-container">
        <div className="button">
            <button>
                <NavLink className="nl1" to="/home">
                    Back to Home
                </NavLink>
            </button>
        </div>
        
      <div className="player-card">

        

        <video
          controls
          className="main-video"
        >
          <source
            src={video.videoFile}
            type="video/mp4"
          />
        </video>

        <h2>{video.title}</h2>

        <p>{video.description}</p>

      </div>

    </div>
  );
}

export default VideoPlayer;