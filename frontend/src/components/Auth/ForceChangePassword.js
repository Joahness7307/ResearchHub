import React, { useState, useContext } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AuthForm.css";


const ForceChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Prevent access if force_password_change is false
  React.useEffect(() => {
    if (user && !user.force_password_change) {
      // Redirect to dashboard based on role
      switch(user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "head_admin":
          navigate("/head-admin");
          break;
        case "guest":
          navigate("/guest");
          break;
        case "research_adviser":
          navigate("/adviser");
          break;
        default:
          navigate("/projects");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMsg("");
    if (!password || !confirm_password) { setError("Both fields are required."); return; }
    if (password !== confirm_password) { setError("Passwords do not match."); return; }
    try {
      await axios.post("/users/force-change-password", { password, confirm_password });
      setMsg("Password changed. Redirecting...");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-login-form" onSubmit={handleSubmit}>
        <h2>Change Password</h2>
        <p className="subtext">You must change your password before continuing.</p>
        {msg && <div className="auth-success">{msg}</div>}
        {error && <div className="auth-error">{error}</div>}
        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" required />
        <input type="password" placeholder="Confirm New Password" value={confirm_password} onChange={e => setConfirm(e.target.value)} className="auth-input" required />
        <button type="submit">Save New Password</button>
      </form>
    </div>
  );
};

export default ForceChangePassword;