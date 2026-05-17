// src/pages/ChangePassword.jsx

import { useState } from "react";

export default function ChangePassword({
  onSubmit,
  goBack,
  message,
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();

    onSubmit({
      oldPassword,
      newPassword,
    });

    setOldPassword("");
    setNewPassword("");
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={submitHandler}>
        <h2>Change Password</h2>

        <input
          style={styles.input}
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button style={styles.button}>Update Password</button>

        <button
          type="button"
          style={styles.back}
          onClick={goBack}
        >
          Back
        </button>

        <p>{message}</p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
  },
  card: {
    width: "350px",
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  back: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};