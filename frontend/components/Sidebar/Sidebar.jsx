import { NavLink } from "react-router-dom";
import { Clapperboard, Menu, Plus, UserRound, House } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ isCollapsed, onToggle }) {
  return (
    <aside className={`app-sidebar ${isCollapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-brand-row">
        <button
          className="sidebar-menu-button"
          type="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          onClick={onToggle}
        >
          <Menu size={21} />
        </button>
        <NavLink className="brand-link" to="/home" aria-label="FunTube home">
          <span className="brand-mark">
            <Clapperboard size={19} fill="currentColor" />
          </span>
          <span className="brand-name">FunTube</span>
        </NavLink>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink
          to="/home"
          end
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
          title="Home"
        >
          <House size={21} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
          title="Your channel"
        >
          <UserRound size={21} />
          <span>Your channel</span>
        </NavLink>
        <NavLink
          to="/upload-video"
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? "active" : ""}`
          }
          title="Upload video"
        >
          <Plus size={21} />
          <span>Create video</span>
        </NavLink>
      </nav>

      <div className="sidebar-note">
        <span className="sidebar-note-mark">
          <Clapperboard size={16} />
        </span>
        <p>Discover videos from your community.</p>
      </div>
    </aside>
  );
}
