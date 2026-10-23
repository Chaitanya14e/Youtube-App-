import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Heart, Users, Video } from "lucide-react";
import { toast } from "react-toastify";
import {
  deleteVideo,
  getChannelStats,
  getChannelVideos,
  toggleVideoPublished,
  updateVideo,
} from "../../src/lib/api";
import "../FeaturePages.css";

const emptyStats = {
  totalViews: 0,
  totalSubscribers: 0,
  totalVideos: 0,
  totalLikes: 0,
};

export default function Studio() {
  const [stats, setStats] = useState(emptyStats);
  const [videos, setVideos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStudio = useCallback(async () => {
    try {
      const [statsResponse, videosResponse] = await Promise.all([
        getChannelStats(),
        getChannelVideos(1, 50),
      ]);
      setStats(statsResponse.data || emptyStats);
      const result = videosResponse.data || {};
      setVideos(result.docs || result.videos || []);
    } catch (error) {
      toast.error(error.message || "Couldn't load your creator studio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([getChannelStats(), getChannelVideos(1, 50)])
      .then(([statsResponse, videosResponse]) => {
        setStats(statsResponse.data || emptyStats);
        const result = videosResponse.data || {};
        setVideos(result.docs || result.videos || []);
      })
      .catch((error) => toast.error(error.message || "Couldn't load your creator studio."))
      .finally(() => setLoading(false));
  }, []);

  const changePublished = async (video) => {
    try {
      await toggleVideoPublished(video._id);
      await loadStudio();
    } catch (error) {
      toast.error(error.message || "Couldn't update the video's visibility.");
    }
  };

  const removeVideo = async (videoId) => {
    if (!window.confirm("Delete this video? This action cannot be undone.")) return;
    try {
      await deleteVideo(videoId);
      toast.success("Video deleted.");
      await loadStudio();
    } catch (error) {
      toast.error(error.message || "Couldn't delete this video.");
    }
  };

  const saveVideo = async (event) => {
    event.preventDefault();
    try {
      await updateVideo(editing._id, {
        title: editing.title,
        description: editing.description,
      });
      setEditing(null);
      toast.success("Video details updated.");
      await loadStudio();
    } catch (error) {
      toast.error(error.message || "Couldn't update this video.");
    }
  };

  return (
    <main className="feature-page">
      <div className="feature-page-inner">
        <header className="feature-page-header">
          <div>
            <Link className="feature-back" to="/home"><ArrowLeft size={16} /> Back to home</Link>
            <h1>Creator studio</h1>
            <p>Manage your videos and keep track of your channel.</p>
          </div>
          <Link className="feature-button primary" to="/upload-video">Upload video</Link>
        </header>

        <section className="feature-stats" aria-label="Channel statistics">
          {[
            [Eye, "Total views", stats.totalViews],
            [Users, "Subscribers", stats.totalSubscribers],
            [Video, "Videos", stats.totalVideos],
            [Heart, "Video likes", stats.totalLikes],
          ].map(([Icon, label, value]) => (
            <article className="feature-stat" key={label}>
              <Icon size={19} />
              <strong>{Number(value || 0).toLocaleString()}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section className="feature-panel">
          <h2>Your videos</h2>
          {loading ? <p className="feature-muted">Loading your videos…</p> : videos.length ? videos.map((video) => (
            <article className="feature-video-row" key={video._id}>
              <Link to={`/video/${video._id}`}>
                <img src={video.thumbnail} alt="" />
              </Link>
              <div className="feature-video-copy">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <p>{Number(video.views || 0).toLocaleString()} views · {video.isPublished ? "Published" : "Unpublished"}</p>
              </div>
              <div className="feature-row">
                <button className="feature-button" type="button" onClick={() => setEditing({ ...video })}>Edit</button>
                <button className="feature-button" type="button" onClick={() => changePublished(video)}>
                  {video.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button className="feature-button danger" type="button" onClick={() => removeVideo(video._id)}>Delete</button>
              </div>
            </article>
          )) : <div className="feature-empty">You haven't uploaded any videos yet.</div>}
        </section>

        {editing && (
          <section className="feature-panel">
            <h2>Edit video</h2>
            <form onSubmit={saveVideo}>
              <label className="feature-field">
                Title
                <input value={editing.title} maxLength={120} required onChange={(event) => setEditing({ ...editing, title: event.target.value })} />
              </label>
              <label className="feature-field">
                Description
                <textarea value={editing.description} required onChange={(event) => setEditing({ ...editing, description: event.target.value })} />
              </label>
              <div className="feature-form-actions">
                <button className="feature-button" type="button" onClick={() => setEditing(null)}>Cancel</button>
                <button className="feature-button primary" type="submit">Save changes</button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
