// src/components/Sidebar/Sidebar.jsx

import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Top */}
      <div className="sidebar-top">
        <button
          className="menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
        <h2 className="logo">FunTube</h2>
      </div>
      {/* Menu */}
      <NavLink to="/home" className="menu-item" 
      // </div>style={
        // ({isActive})=>({
        //     color: isActive? "black" : "black"
        // })
        
        //}
      >
        <span>🏠</span>
        {isOpen && <p>Home</p>}
      </NavLink>

      <div className="menu-item">
        <span>🎬</span>
        {isOpen && <p>Shorts</p>}
      </div>

      <div className="menu-item">
        <span>📺</span>
        {isOpen && <p>Subscriptions</p>}
      </div>

      <NavLink to="/profile" className="menu-item">
        <span>👤</span>
        {isOpen && <p>You</p>}
      </NavLink>

    </div>
  );
}