import React, { useState } from "react";
import axios from "../../api/axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./AuthForm.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(""); setError("");
    
    if (!token) {
        setError("Invalid or missing reset token.");
        return;
    }
    
    try {
      // NOTE: Ensure your backend endpoint matches the structure
      await axios.post(`/users/reset-password/${token}`, { password });
      setMsg("Password reset successful! You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-login-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="subtext">Enter your new password.</p>
        {msg && <div className="auth-success">{msg}</div>}
        {error && <div className="auth-error">{error}</div>}
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <button type="submit">Save New Password</button>
        <div className="auth-switch">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;