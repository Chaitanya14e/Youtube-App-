import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllVideos,
  getChannelProfile,
  getChannelSubscribers,
  toggleSubscription,
} from "../../src/lib/api";
import "../FeaturePages.css";

export default function Channel({ user }) {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [loading, setLoading] = useState(true);
  const isOwnChannel = String(channel?._id) === String(user?._id);

  useEffect(() => {
    let isCurrent = true;
    getChannelProfile(username)
      .then(async (response) => {
        const profile = response.data;
        const [videosResponse, subscriberResponse] = await Promise.all([
          getAllVideos({ userId: profile._id, limit: 50 }),
          getChannelSubscribers(profile._id),
        ]);
        if (!isCurrent) return;
        setChannel(profile);
        setVideos(videosResponse.data?.videos || []);
        setSubscribers(subscriberResponse.data || []);
      })
      .catch((error) => {
        if (!isCurrent) return;
        toast.error(error.message || "Couldn't load this channel.");
        setChannel(null);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [username]);

  const subscribe = async () => {
    try {
      await toggleSubscription(channel._id);
      setChannel((current) => ({
        ...current,
        isSubscribed: !current.isSubscribed,
        subscribersCount: current.subscribersCount + (current.isSubscribed ? -1 : 1),
      }));
    } catch (error) {
      toast.error(error.message || "Couldn't update your subscription.");
    }
  };

  return (
    <main className="feature-page">
      <div className="feature-page-inner">
        <header className="feature-page-header">
          <div>
            <Link className="feature-back" to="/home"><ArrowLeft size={16} /> Back to home</Link>
          </div>
        </header>
        {loading ? <p className="feature-muted">Loading channel…</p> : !channel ? (
          <div className="feature-panel feature-empty">This channel could not be found.</div>
        ) : (
          <>
            {channel.coverImage ? <img className="channel-cover" src={channel.coverImage} alt="" /> : null}
            <section className="channel-summary">
              <img src={channel.avatar} alt="" />
              <div className="channel-summary-copy">
                <h1>{channel.fullname}</h1>
                <p>@{channel.username} · {channel.subscribersCount || 0} subscribers · {channel.channelsSubscribedToCount || 0} subscriptions</p>
              </div>
              {!isOwnChannel && (
                <button className="feature-button primary" type="button" onClick={subscribe}>
                  {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
              {isOwnChannel && <Link className="feature-button" to="/profile">Edit channel</Link>}
            </section>
            <div className="feature-row">
              <button className="feature-button" type="button" onClick={() => setShowSubscribers((current) => !current)}>
                <Users size={16} /> {showSubscribers ? "Hide subscribers" : "View subscribers"}
              </button>
              {isOwnChannel && <Link className="feature-button" to="/studio">Creator studio</Link>}
            </div>
            {showSubscribers && (
              <section className="feature-panel">
                <h2>Subscribers</h2>
                {subscribers.length ? subscribers.map((entry) => {
                  const subscriber = entry.subscriber || {};
                  return (
                    <div className="feature-list-row" key={entry._id}>
                      <img className="channel-avatar" src={subscriber.avatar} alt="" />
                      <Link to={`/channel/${encodeURIComponent(subscriber.username || "")}`}>
                        {subscriber.fullname || subscriber.username}
                      </Link>
                    </div>
                  );
                }) : <p className="feature-muted">No subscribers yet.</p>}
              </section>
            )}
            <section className="feature-panel">
              <h2>Videos</h2>
              {videos.length ? (
                <div className="feature-grid">
                  {videos.map((video) => (
                    <article className="library-video" key={video._id}>
                      <Link to={`/video/${video._id}`}><img src={video.thumbnail} alt="" /></Link>
                      <div className="library-video-copy">
                        <Link to={`/video/${video._id}`}>{video.title}</Link>
                        <p>{Number(video.views || 0).toLocaleString()} views</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="feature-empty">This creator hasn't published any videos yet.</div>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
