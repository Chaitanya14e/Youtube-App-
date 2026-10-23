import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clapperboard, Eye, Heart, ListPlus, Send } from "lucide-react";
import { toast } from "react-toastify";
import {
  addVideoComment,
  addVideoToPlaylist,
  deleteVideoComment,
  getVideoById,
  getUserPlaylists,
  getChannelProfile,
  getVideoComments,
  toggleCommentLike,
  toggleSubscription,
  toggleVideoLike,
  updateVideoComment,
} from "../../src/lib/api";
import "./VideoPlayer.css";
import "../FeaturePages.css";

function formatCount(value = 0) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function VideoPlayer({ user }) {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState("");
  const [editText, setEditText] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isLiked, setIsLiked] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState("");
  const videoUrl = video?.videoFile?.replace(/^http:\/\//i, "https://");
  const thumbnailUrl = video?.thumbnail?.replace(/^http:\/\//i, "https://");

  const loadComments = useCallback(async () => {
    try {
      const response = await getVideoComments(videoId);
      setComments(response.data?.comments || []);
    } catch (requestError) {
      toast.error(requestError.message || "Couldn't load comments.");
    } finally {
      setCommentsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchVideo = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getVideoById(videoId);
        if (isCurrentRequest) {
          setVideo(response.data);
          setIsLiked(Boolean(response.data?.isLiked));
          setLikeCount(response.data?.likeCount || 0);
        }
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

  useEffect(() => {
    let isCurrentRequest = true;
    getVideoComments(videoId)
      .then((response) => {
        if (!isCurrentRequest) return;
        const nextComments = response.data?.comments || [];
        setComments(nextComments);
        setCommentLikes(Object.fromEntries(
          nextComments.map((comment) => [comment._id, Boolean(comment.isLiked)]),
        ));
      })
      .catch((requestError) => {
        if (isCurrentRequest) toast.error(requestError.message || "Couldn't load comments.");
      })
      .finally(() => {
        if (isCurrentRequest) setCommentsLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [videoId]);

  useEffect(() => {
    if (!user?._id) return;
    getUserPlaylists(user._id)
      .then((response) => setPlaylists(response.data || []))
      .catch((requestError) =>
        toast.error(requestError.message || "Couldn't load your playlists."),
      );
  }, [user?._id]);

  useEffect(() => {
    if (!video?.owner?.username || video.owner._id === user?._id) return;
    getChannelProfile(video.owner.username)
      .then((response) => setIsSubscribed(Boolean(response.data?.isSubscribed)))
      .catch((requestError) =>
        toast.error(requestError.message || "Couldn't load subscription status."),
      );
  }, [user?._id, video?.owner?._id, video?.owner?.username]);

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addVideoComment(videoId, commentText.trim());
      setCommentText("");
      await loadComments();
    } catch (requestError) {
      toast.error(requestError.message || "Couldn't add your comment.");
    }
  };

  const handleSaveComment = async (commentId) => {
    try {
      await updateVideoComment(commentId, editText.trim());
      setEditingComment("");
      await loadComments();
    } catch (requestError) {
      toast.error(requestError.message || "Couldn't update your comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteVideoComment(commentId);
      await loadComments();
    } catch (requestError) {
      toast.error(requestError.message || "Couldn't delete your comment.");
    }
  };

  const handleLike = async () => {
    try {
      const response = await toggleVideoLike(videoId);
      const nextIsLiked = Boolean(response.data?.isLiked);
      setIsLiked(nextIsLiked);
      setLikeCount((current) => Math.max(0, current + (nextIsLiked ? 1 : -1)));
    } catch (requestError) {
      toast.error(requestError.message || "Couldn't update the video like.");
    }
  };

  const handleSubscribe = async () => {
    try {
      await toggleSubscription(video.owner._id);
      setIsSubscribed((current) => !current);
    } catch (requestError) {
      toast.error(requestError.message || "Couldn't update your subscription.");
    }
  };

  const handleSaveToPlaylist = async (playlistId) => {
    try {
      await addVideoToPlaylist(videoId, playlistId);
      toast.success("Video saved to playlist.");
      setShowPlaylists(false);
    } catch (requestError) {
      toast.error(requestError.message || "Couldn't save this video.");
    }
  };

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
                <Link to={`/channel/${encodeURIComponent(video.owner?.username || "")}`}>
                  @{video.owner?.username || "creator"}
                </Link>
              </div>
              {video.owner?._id !== user?._id && (
                <button className="feature-button subscribe-button" type="button" onClick={handleSubscribe}>
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
              <span className="watch-views">
                <Eye size={16} />
                {formatCount(video.views)} views
              </span>
            </div>
            <div className="watch-actions">
              <button className="feature-button" type="button" onClick={handleLike}>
                <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
                {isLiked ? "Liked" : "Like"} · {likeCount}
              </button>
              <button
                className="feature-button"
                type="button"
                onClick={() => setShowPlaylists((current) => !current)}
              >
                <ListPlus size={17} /> Save to playlist
              </button>
              {showPlaylists && (
                <div className="playlist-picker">
                  {playlists.length ? playlists.map((playlist) => (
                    <button
                      type="button"
                      key={playlist._id}
                      onClick={() => handleSaveToPlaylist(playlist._id)}
                    >
                      {playlist.name}
                    </button>
                  )) : <Link to="/library">Create a playlist first</Link>}
                </div>
              )}
            </div>
            <div className="watch-description">
              <p>{video.description}</p>
            </div>
            <section className="comments-section">
              <h2>Comments</h2>
              <form className="comment-form" onSubmit={handleAddComment}>
                <input
                  aria-label="Add a comment"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  maxLength={1000}
                />
                <button className="feature-button" type="submit" disabled={!commentText.trim()}>
                  <Send size={16} /> Comment
                </button>
              </form>
              {commentsLoading ? <p className="feature-muted">Loading comments…</p> : (
                <div className="comment-list">
                  {comments.length ? comments.map((comment) => {
                    const isOwner = String(comment.owner?._id || comment.owner) === String(user?._id);
                    return (
                      <article className="comment-card" key={comment._id}>
                        <img
                          src={comment.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.owner?.username || "Creator")}&background=27272a&color=fff`}
                          alt=""
                        />
                        <div className="comment-content">
                          <strong>@{comment.owner?.username || "creator"}</strong>
                          {editingComment === comment._id ? (
                            <>
                              <textarea value={editText} onChange={(event) => setEditText(event.target.value)} />
                              <div className="comment-controls">
                                <button type="button" onClick={() => handleSaveComment(comment._id)}>Save</button>
                                <button type="button" onClick={() => setEditingComment("")}>Cancel</button>
                              </div>
                            </>
                          ) : <p>{comment.content}</p>}
                          <div className="comment-controls">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const response = await toggleCommentLike(comment._id);
                                  setCommentLikes((states) => ({
                                    ...states,
                                    [comment._id]: response.data?.isLiked,
                                  }));
                                } catch (requestError) {
                                  toast.error(requestError.message || "Couldn't like this comment.");
                                }
                              }}
                            >
                              <Heart size={14} fill={commentLikes[comment._id] ? "currentColor" : "none"} />
                              {commentLikes[comment._id] ? "Liked" : "Like"}
                              {comment.likeCount ? ` · ${comment.likeCount}` : ""}
                            </button>
                            {isOwner && editingComment !== comment._id && (
                              <>
                                <button type="button" onClick={() => {
                                  setEditingComment(comment._id);
                                  setEditText(comment.content);
                                }}>Edit</button>
                                <button type="button" onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  }) : <p className="feature-muted">Be the first to comment.</p>}
                </div>
              )}
            </section>
          </section>
        </div>
      ) : null}
    </main>
  );
}
