// src/pages/ChangePassword.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clapperboard } from "lucide-react";
import "./ChangePassword.css";

export default function ChangePassword({
  onSubmit,
  message,
}) {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    const success = await onSubmit({ oldPassword, newPassword });
    setIsSaving(false);
    if (success) {
      setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <main className="password-page">
      <header className="password-header">
        <Link className="password-brand" to="/home">
          <span>
            <Clapperboard size={18} fill="currentColor" />
          </span>
          FunTube
        </Link>
        <Link className="password-back" to="/home">
          <ArrowLeft size={17} />
          Back to feed
        </Link>
      </header>
      <form className="password-card" onSubmit={submitHandler}>
        <h1>Change password</h1>
        <p>Choose a strong password to keep your account secure.</p>
        <label htmlFor="old-password">Current password</label>
        <input
          id="old-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your current password"
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
          required
        />
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter a new password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        {message && <p className="password-message">{message}</p>}
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Update password"}
        </button>
        <button
          className="password-cancel"
          type="button"
          onClick={() => navigate("/home")}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}