import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Pencil, Send, Upload } from "lucide-react";
import { toast } from "react-toastify";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  toggleTweetLike,
  updateAccountDetails,
  updateTweet,
  updateUserAvatar,
  updateUserCoverImage,
} from "../../src/lib/api";
import "../FeaturePages.css";

export default function Profile({ user, onUserUpdated }) {
  const [account, setAccount] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
  });
  const [tweetText, setTweetText] = useState("");
  const [tweets, setTweets] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [likeStates, setLikeStates] = useState({});
  const [saving, setSaving] = useState(false);

  const loadTweets = useCallback(async () => {
    try {
      const response = await getUserTweets(user._id);
      setTweets(response.data || []);
      setLikeStates(Object.fromEntries(
        (response.data || []).map((tweet) => [tweet._id, Boolean(tweet.isLiked)]),
      ));
    } catch (error) {
      toast.error(error.message || "Couldn't load your posts.");
    }
  }, [user._id]);

  useEffect(() => {
    getUserTweets(user._id)
      .then((response) => {
        setTweets(response.data || []);
        setLikeStates(Object.fromEntries(
          (response.data || []).map((tweet) => [tweet._id, Boolean(tweet.isLiked)]),
        ));
      })
      .catch((error) => toast.error(error.message || "Couldn't load your posts."));
  }, [user._id]);

  const saveAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await updateAccountDetails(account);
      onUserUpdated(response.data);
      toast.success("Account details updated.");
    } catch (error) {
      toast.error(error.message || "Couldn't update account details.");
    } finally {
      setSaving(false);
    }
  };

  const updateImage = async (kind, file) => {
    if (!file) return;
    try {
      const response = kind === "avatar"
        ? await updateUserAvatar(file)
        : await updateUserCoverImage(file);
      onUserUpdated(response.data);
      toast.success(`${kind === "avatar" ? "Avatar" : "Cover image"} updated.`);
    } catch (error) {
      toast.error(error.message || `Couldn't update your ${kind}.`);
    }
  };

  const submitTweet = async (event) => {
    event.preventDefault();
    if (!tweetText.trim()) return;
    try {
      await createTweet(tweetText.trim());
      setTweetText("");
      await loadTweets();
    } catch (error) {
      toast.error(error.message || "Couldn't publish your post.");
    }
  };

  const saveTweet = async (tweetId) => {
    try {
      await updateTweet(tweetId, editingText.trim());
      setEditingId("");
      await loadTweets();
    } catch (error) {
      toast.error(error.message || "Couldn't update your post.");
    }
  };

  const removeTweet = async (tweetId) => {
    try {
      await deleteTweet(tweetId);
      await loadTweets();
    } catch (error) {
      toast.error(error.message || "Couldn't delete your post.");
    }
  };

  return (
    <main className="feature-page">
      <div className="feature-page-inner">
        <header className="feature-page-header">
          <div>
            <Link className="feature-back" to="/home"><ArrowLeft size={16} /> Back to home</Link>
            <h1>Your channel</h1>
            <p>Manage your account, channel images, and community posts.</p>
          </div>
          <Link className="feature-button" to={`/channel/${encodeURIComponent(user.username)}`}>View public channel</Link>
        </header>

        {user.coverImage && <img className="channel-cover" src={user.coverImage} alt="Channel cover" />}
        <section className="feature-panel">
          <h2>Channel appearance</h2>
          <div className="feature-row">
            <img className="channel-avatar" src={user.avatar} alt="Your avatar" />
            <label className="feature-button">
              <Upload size={15} /> Update avatar
              <input hidden type="file" accept="image/*" onChange={(event) => updateImage("avatar", event.target.files?.[0])} />
            </label>
            <label className="feature-button">
              <Upload size={15} /> Update cover image
              <input hidden type="file" accept="image/*" onChange={(event) => updateImage("cover", event.target.files?.[0])} />
            </label>
          </div>
        </section>

        <section className="feature-panel">
          <h2>Account details</h2>
          <form onSubmit={saveAccount}>
            <label className="feature-field">
              Full name
              <input value={account.fullname} required onChange={(event) => setAccount({ ...account, fullname: event.target.value })} />
            </label>
            <label className="feature-field">
              Email
              <input type="email" value={account.email} required onChange={(event) => setAccount({ ...account, email: event.target.value })} />
            </label>
            <p className="feature-muted">Username: @{user.username}</p>
            <div className="feature-form-actions">
              <button className="feature-button primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save account details"}</button>
              <Link className="feature-button" to="/change-password">Change password</Link>
            </div>
          </form>
        </section>

        <section className="feature-panel">
          <h2>Community posts</h2>
          <form className="comment-form" onSubmit={submitTweet}>
            <input
              aria-label="Write a post"
              placeholder="Share an update with your community"
              value={tweetText}
              maxLength={1000}
              onChange={(event) => setTweetText(event.target.value)}
            />
            <button className="feature-button primary" type="submit" disabled={!tweetText.trim()}><Send size={15} /> Post</button>
          </form>
          {tweets.length ? tweets.map((tweet) => (
            <article className="tweet-card feature-list-row" key={tweet._id}>
              <div className="comment-content">
                <span className="feature-muted">{new Date(tweet.createdAt).toLocaleString()}</span>
                {editingId === tweet._id ? (
                  <>
                    <textarea className="feature-select" value={editingText} onChange={(event) => setEditingText(event.target.value)} />
                    <div className="feature-row">
                      <button className="feature-button" type="button" onClick={() => saveTweet(tweet._id)}>Save</button>
                      <button className="feature-button" type="button" onClick={() => setEditingId("")}>Cancel</button>
                    </div>
                  </>
                ) : <p>{tweet.content}</p>}
                <div className="feature-row">
                  <button className="feature-button" type="button" onClick={async () => {
                    try {
                      const response = await toggleTweetLike(tweet._id);
                      setLikeStates((states) => ({ ...states, [tweet._id]: response.data?.isLiked }));
                    } catch (error) {
                      toast.error(error.message || "Couldn't like this post.");
                    }
                  }}>
                    <Heart size={15} fill={likeStates[tweet._id] ? "currentColor" : "none"} />
                    {likeStates[tweet._id] ? "Liked" : "Like"}
                  </button>
                  {editingId !== tweet._id && (
                    <>
                      <button className="feature-button" type="button" onClick={() => {
                        setEditingId(tweet._id);
                        setEditingText(tweet.content);
                      }}><Pencil size={14} /> Edit</button>
                      <button className="feature-button danger" type="button" onClick={() => removeTweet(tweet._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </article>
          )) : <div className="feature-empty">You haven't posted anything yet.</div>}
        </section>
      </div>
    </main>
  );
}
