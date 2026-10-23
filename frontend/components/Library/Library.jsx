import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ListPlus, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllVideos,
  getLikedVideos,
  getPlaylistById,
  getSubscribedChannels,
  getUserPlaylists,
  getWatchHistory,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../../src/lib/api";
import "../FeaturePages.css";

const tabs = ["History", "Liked videos", "Subscriptions", "Playlists"];

function videosFromLiked(response) {
  return (response.data?.likedVideos || [])
    .map((entry) => entry.videoDetails)
    .filter(Boolean);
}

function VideoGrid({ videos }) {
  if (!videos.length) return <div className="feature-empty">Nothing here yet.</div>;
  return (
    <div className="feature-grid">
      {videos.map((video) => (
        <article className="library-video" key={video._id}>
          <Link to={`/video/${video._id}`}><img src={video.thumbnail} alt="" loading="lazy" /></Link>
          <div className="library-video-copy">
            <Link to={`/video/${video._id}`}>{video.title}</Link>
            <p>{video.owner?.fullname || video.owner?.username || video.ownerDetails?.[0]?.username || "FunTube creator"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Library({ user }) {
  const [tab, setTab] = useState("History");
  const [items, setItems] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlistForm, setPlaylistForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  const loadPlaylists = useCallback(async () => {
    const response = await getUserPlaylists(user._id);
    setPlaylists(response.data || []);
  }, [user._id]);

  useEffect(() => {
    const loadRequest = tab === "History"
      ? getWatchHistory()
      : tab === "Liked videos"
        ? getLikedVideos()
        : tab === "Subscriptions"
          ? getSubscribedChannels(user._id)
          : getUserPlaylists(user._id);
    loadRequest
      .then((response) => {
        if (tab === "Liked videos") {
          setItems(videosFromLiked(response));
        } else if (tab === "History" || tab === "Subscriptions") {
          setItems(response.data || []);
        } else {
          setPlaylists(response.data || []);
        }
      })
      .catch((error) => toast.error(error.message || `Couldn't load ${tab.toLowerCase()}.`))
      .finally(() => setLoading(false));
  }, [tab, user._id]);

  const openPlaylist = async (playlistId) => {
    try {
      const response = await getPlaylistById(playlistId);
      setSelectedPlaylist(response.data?.[0] || null);
      setSearchResults([]);
      setSearch("");
    } catch (error) {
      toast.error(error.message || "Couldn't open this playlist.");
    }
  };

  const submitPlaylist = async (event) => {
    event.preventDefault();
    try {
      if (selectedPlaylist) {
        const response = await updatePlaylist(selectedPlaylist._id, playlistForm);
        setSelectedPlaylist((current) => ({ ...current, ...response.data }));
      } else {
        await createPlaylist(playlistForm);
        setPlaylistForm({ name: "", description: "" });
      }
      toast.success(selectedPlaylist ? "Playlist updated." : "Playlist created.");
      await loadPlaylists();
    } catch (error) {
      toast.error(error.message || "Couldn't save this playlist.");
    }
  };

  const removeCurrentPlaylist = async (playlistId) => {
    if (!window.confirm("Delete this playlist?")) return;
    try {
      await deletePlaylist(playlistId);
      setSelectedPlaylist(null);
      setPlaylistForm({ name: "", description: "" });
      await loadPlaylists();
    } catch (error) {
      toast.error(error.message || "Couldn't delete this playlist.");
    }
  };

  const searchVideos = async (event) => {
    event.preventDefault();
    try {
      const response = await getAllVideos({ query: search, limit: 8 });
      setSearchResults(response.data?.videos || []);
    } catch (error) {
      toast.error(error.message || "Couldn't search for videos.");
    }
  };

  const addVideo = async (videoId) => {
    try {
      await addVideoToPlaylist(videoId, selectedPlaylist._id);
      await openPlaylist(selectedPlaylist._id);
      await loadPlaylists();
      toast.success("Video added to playlist.");
    } catch (error) {
      toast.error(error.message || "Couldn't add this video.");
    }
  };

  const removeVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(videoId, selectedPlaylist._id);
      await openPlaylist(selectedPlaylist._id);
      await loadPlaylists();
    } catch (error) {
      toast.error(error.message || "Couldn't remove this video.");
    }
  };

  const selectTab = (nextTab) => {
    setLoading(true);
    setTab(nextTab);
    setSelectedPlaylist(null);
    setPlaylistForm({ name: "", description: "" });
  };

  return (
    <main className="feature-page">
      <div className="feature-page-inner">
        <header className="feature-page-header">
          <div>
            <Link className="feature-back" to="/home"><ArrowLeft size={16} /> Back to home</Link>
            <h1>Your library</h1>
            <p>Pick up where you left off and organize videos you love.</p>
          </div>
        </header>

        <nav className="feature-tabs" aria-label="Library">
          {tabs.map((item) => (
            <button key={item} type="button" aria-selected={tab === item} onClick={() => selectTab(item)}>{item}</button>
          ))}
        </nav>

        {loading ? <p className="feature-muted">Loading your library…</p> : null}

        {!loading && (tab === "History" || tab === "Liked videos") && (
          <VideoGrid videos={items} />
        )}

        {!loading && tab === "Subscriptions" && (
          <section className="feature-panel">
            <h2>Channels you follow</h2>
            {items.length ? items.map((entry) => {
              const channel = entry.channel || {};
              return (
                <div className="feature-list-row" key={entry._id}>
                  <img className="channel-avatar" src={channel.avatar} alt="" />
                  <Link to={`/channel/${encodeURIComponent(channel.username || "")}`}>
                    {channel.fullname || channel.username}
                  </Link>
                  <span className="feature-muted">@{channel.username}</span>
                </div>
              );
            }) : <div className="feature-empty">You haven't subscribed to any channels.</div>}
          </section>
        )}

        {!loading && tab === "Playlists" && (
          <div className="library-layout">
            <section className="feature-panel">
              <h2>Your playlists</h2>
              {playlists.length ? playlists.map((playlist) => (
                <div className="feature-list-row" key={playlist._id}>
                  <button className="feature-button" type="button" onClick={() => {
                    setPlaylistForm({ name: playlist.name, description: playlist.description || "" });
                    openPlaylist(playlist._id);
                  }}>
                    {playlist.name} <span className="feature-muted">({playlist.totalVideos ?? playlist.videos?.length ?? 0})</span>
                  </button>
                </div>
              )) : <p className="feature-muted">Create a playlist to save videos for later.</p>}
            </section>

            <section className="feature-panel">
              <h2>{selectedPlaylist ? "Manage playlist" : "Create a playlist"}</h2>
              <form onSubmit={submitPlaylist}>
                <label className="feature-field">
                  Name
                  <input value={playlistForm.name} required maxLength={100} onChange={(event) => setPlaylistForm({ ...playlistForm, name: event.target.value })} />
                </label>
                <label className="feature-field">
                  Description
                  <textarea value={playlistForm.description} required onChange={(event) => setPlaylistForm({ ...playlistForm, description: event.target.value })} />
                </label>
                <div className="feature-row">
                  <button className="feature-button primary" type="submit">{selectedPlaylist ? "Save changes" : "Create playlist"}</button>
                  {selectedPlaylist && (
                    <>
                      <button className="feature-button" type="button" onClick={() => {
                        setSelectedPlaylist(null);
                        setPlaylistForm({ name: "", description: "" });
                      }}>New playlist</button>
                      <button className="feature-button danger" type="button" onClick={() => removeCurrentPlaylist(selectedPlaylist._id)}><Trash2 size={15} /> Delete</button>
                    </>
                  )}
                </div>
              </form>

              {selectedPlaylist && (
                <>
                  <form className="feature-row" onSubmit={searchVideos}>
                    <input className="feature-select" value={search} placeholder="Search videos to add" onChange={(event) => setSearch(event.target.value)} />
                    <button className="feature-button" type="submit"><ListPlus size={16} /> Find videos</button>
                  </form>
                  {searchResults.map((video) => (
                    <div className="feature-list-row" key={video._id}>
                      <span>{video.title}</span>
                      <button className="feature-button" type="button" onClick={() => addVideo(video._id)}><Plus size={15} /> Add</button>
                    </div>
                  ))}
                  <h3>Videos in this playlist</h3>
                  <VideoGrid videos={selectedPlaylist.videoDetails || []} />
                  {(selectedPlaylist.videoDetails || []).map((video) => (
                    <button className="feature-button danger" type="button" key={`remove-${video._id}`} onClick={() => removeVideo(video._id)}>
                      Remove {video.title}
                    </button>
                  ))}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
