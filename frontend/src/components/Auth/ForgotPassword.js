import React, { useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import "./AuthForm.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      // NOTE: Ensure your backend endpoint is correctly configured to send the email
      await axios.post("/users/forgot-password", { email });
      setMsg("Please check your email, a reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-login-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p className="subtext">Enter your email to receive a reset link.</p>
        {msg && <div className="auth-success">{msg}</div>}
        {error && <div className="auth-error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit">Send Email</button>
        <div className="auth-switch">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;