import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Clock3,
  LogOut,
  Plus,
  Search,
  Video,
} from "lucide-react";
import Sidebar from "../Sidebar/Sidebar";
import { getAllVideos } from "../../src/lib/api";
import "./Home.css";

const filters = ["All", "Newest", "Most viewed"];
const videosPerPage = 24;

function fetchFeed(query, filter, page = 1) {
  return getAllVideos({
    query,
    page,
    limit: videosPerPage,
    sortBy: filter === "Most viewed" ? "views" : "createdAt",
    sortType: "desc",
  });
}

function formatCount(value = 0) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDuration(seconds = 0) {
  const duration = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(duration / 60);
  const remainingSeconds = String(duration % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function timeSince(date) {
  if (!date) return "Recently uploaded";
  const elapsedDays = Math.floor(
    (Date.now() - new Date(date).getTime()) / 86_400_000,
  );

  if (!Number.isFinite(elapsedDays) || elapsedDays < 1) return "Today";
  if (elapsedDays < 7) {
    return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
  }
  const weeks = Math.floor(elapsedDays / 7);
  if (elapsedDays < 30) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(elapsedDays / 30);
  if (elapsedDays < 365) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.floor(elapsedDays / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function Home({ user, onLogout }) {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const debounce = setTimeout(() => {
      setLoading(true);
      setError("");
      setLoadMoreError("");
      setVideos([]);
      setPage(1);
      setTotalPages(1);

      fetchFeed(search.trim(), activeFilter)
        .then((response) => {
          if (!isMounted) return;
          setVideos(response.data?.videos ?? []);
          setTotalPages(response.data?.totalPages ?? 1);
        })
        .catch((requestError) => {
          if (isMounted) {
            setError(requestError.message || "We couldn't load videos.");
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [activeFilter, search]);

  const retryFetchVideos = () => {
    setLoading(true);
    setError("");
    fetchFeed(search.trim(), activeFilter)
      .then((response) => {
        setVideos(response.data?.videos ?? []);
        setPage(1);
        setTotalPages(response.data?.totalPages ?? 1);
      })
      .catch((requestError) => {
        setError(requestError.message || "We couldn't load videos.");
      })
      .finally(() => setLoading(false));
  };

  const loadMoreVideos = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setLoadMoreError("");
    fetchFeed(search.trim(), activeFilter, nextPage)
      .then((response) => {
        setVideos((currentVideos) => [
          ...currentVideos,
          ...(response.data?.videos ?? []),
        ]);
        setPage(nextPage);
        setTotalPages(response.data?.totalPages ?? totalPages);
      })
      .catch((requestError) => {
        setLoadMoreError(requestError.message || "Couldn't load more videos.");
      })
      .finally(() => setLoadingMore(false));
  };

  const avatar =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || "You")}&background=27272a&color=fff`;

  return (
    <div className={`youtube-app ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
      />

      <div className="youtube-main">
        <header className="topbar">
          <form
            className="search-form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="search-input-wrap">
              <Search size={19} aria-hidden="true" />
              <input
                type="search"
                aria-label="Search videos"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="clear-search"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>
            <button type="submit" className="search-submit" aria-label="Search">
              <Search size={20} />
            </button>
          </form>

          <div className="topbar-actions">
            <Link className="create-button" to="/upload-video">
              <Plus size={19} />
              <span>Create</span>
            </Link>
            <div className="profile-wrap">
              <button
                className="profile-trigger"
                type="button"
                aria-expanded={showMenu}
                aria-label="Open account menu"
                onClick={() => setShowMenu((current) => !current)}
              >
                <img src={avatar} alt="" className="topbar-avatar" />
                <ChevronDown size={15} />
              </button>
              {showMenu && (
                <div className="profile-menu">
                  <div className="profile-menu-user">
                    <img src={avatar} alt="" />
                    <div>
                      <strong>{user?.fullname || user?.username || "Your account"}</strong>
                      <span>{user?.email || ""}</span>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setShowMenu(false)}>
                    <img src={avatar} alt="" />
                    Your channel
                  </Link>
                  <Link
                    to="/change-password"
                    onClick={() => setShowMenu(false)}
                  >
                    <Video size={17} />
                    Change password
                  </Link>
                  <button type="button" onClick={onLogout}>
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="feed">
          <div className="filter-row" aria-label="Sort videos">
            {filters.map((filter) => (
              <button
                className={`filter-chip ${activeFilter === filter ? "selected" : ""}`}
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <section className="feed-section" aria-label="Videos">
            {loading ? (
              <div className="feed-message" role="status">
                <span className="loading-spinner" />
                <p>Finding something good to watch…</p>
              </div>
            ) : error ? (
              <div className="feed-message feed-error">
                <div className="message-icon">!</div>
                <h2>We couldn’t load the videos</h2>
                <p>{error}</p>
                <button
                  className="retry-button"
                  type="button"
                  onClick={retryFetchVideos}
                >
                  Try again
                </button>
              </div>
            ) : videos.length ? (
              <div className="video-grid">
                {videos.map((video) => (
                  <article className="video-card" key={video._id}>
                    <Link
                      className="thumbnail-link"
                      to={`/video/${video._id}`}
                      aria-label={`Watch ${video.title}`}
                    >
                      <img
                        className="video-thumbnail"
                        src={video.thumbnail}
                        alt=""
                        loading="lazy"
                      />
                      <span className="video-duration">
                        {formatDuration(video.duration)}
                      </span>
                    </Link>
                    <div className="video-card-details">
                      <img
                        className="channel-avatar"
                        src={
                          video.owner?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(video.owner?.username || "Creator")}&background=27272a&color=fff`
                        }
                        alt=""
                        loading="lazy"
                      />
                      <div className="video-copy">
                        <Link className="video-card-title" to={`/video/${video._id}`}>
                          {video.title}
                        </Link>
                        <Link
                          className="channel-name"
                          to={`/channel/${encodeURIComponent(video.owner?.username || "")}`}
                        >
                          {video.owner?.fullname ||
                            video.owner?.username ||
                            "FunTube creator"}
                        </Link>
                        <p className="video-metadata">
                          {formatCount(video.views)} views <span>·</span>{" "}
                          {timeSince(video.createdAt)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
                {page < totalPages && (
                  <div className="load-more-wrap">
                    {loadMoreError && (
                      <p className="load-more-error">{loadMoreError}</p>
                    )}
                    <button
                      className="retry-button"
                      type="button"
                      onClick={loadMoreVideos}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading…" : "Load more videos"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="feed-message">
                <div className="message-icon">
                  {search ? <Search size={24} /> : <Clock3 size={24} />}
                </div>
                <h2>{search ? "No videos found" : "Your feed is taking a breather"}</h2>
                <p>
                  {search
                    ? "Try a different search or clear your search."
                    : "There aren’t any videos here yet. Check back soon."}
                </p>
                {search && (
                  <button
                    className="retry-button"
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
