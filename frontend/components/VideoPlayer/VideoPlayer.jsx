import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clapperboard, Eye } from "lucide-react";
import { getVideoById } from "../../src/lib/api";
import "./VideoPlayer.css";

function formatCount(value = 0) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function VideoPlayer() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const videoUrl = video?.videoFile?.replace(/^http:\/\//i, "https://");
  const thumbnailUrl = video?.thumbnail?.replace(/^http:\/\//i, "https://");

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchVideo = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getVideoById(videoId);
        if (isCurrentRequest) setVideo(response.data);
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(requestError.message || "We couldn't load this video.");
          setVideo(null);
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    fetchVideo();
    return () => {
      isCurrentRequest = false;
    };
  }, [videoId]);

  return (
    <main className="watch-page">
      <header className="watch-header">
        <Link className="watch-brand" to="/home">
          <span className="watch-brand-mark">
            <Clapperboard size={18} fill="currentColor" />
          </span>
          FunTube
        </Link>
        <Link className="back-to-feed" to="/home">
          <ArrowLeft size={18} />
          Back to videos
        </Link>
      </header>

      {loading ? (
        <div className="watch-state" role="status">
          <span className="loading-spinner" />
          <p>Loading video…</p>
        </div>
      ) : error ? (
        <div className="watch-state">
          <div className="watch-error-icon">!</div>
          <h1>Video unavailable</h1>
          <p>{error}</p>
          <Link className="watch-back-button" to="/home">
            Return to home
          </Link>
        </div>
      ) : video ? (
        <div className="watch-content">
          <video
            className="watch-video"
            controls
            playsInline
            poster={thumbnailUrl}
            preload="metadata"
          >
            <source src={videoUrl} />
            Your browser does not support HTML video.
          </video>
          <section className="watch-details">
            <h1>{video.title}</h1>
            <div className="watch-channel-row">
              <img
                className="watch-avatar"
                src={
                  video.owner?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(video.owner?.username || "Creator")}&background=27272a&color=fff`
                }
                alt=""
              />
              <div className="watch-channel">
                <strong>
                  {video.owner?.fullname ||
                    video.owner?.username ||
                    "FunTube creator"}
                </strong>
                <span>@{video.owner?.username || "creator"}</span>
              </div>
              <span className="watch-views">
                <Eye size={16} />
                {formatCount(video.views)} views
              </span>
            </div>
            <div className="watch-description">
              <p>{video.description}</p>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
