import React, { useState, useContext } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AuthForm.css";


const ForceChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // ...existing code...
  // Import icons
  // At the top of the file, add:
  // import eyeIcon from "../../assets/eye.png";
  // import hiddenIcon from "../../assets/hidden.png";
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
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="auth-input"
            required
            style={{ paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            style={{
              position: "absolute",
              right: "0.5rem",
              top: "40%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0
            }}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <img
              src={showPassword ? require("../../assets/hidden.png") : require("../../assets/eye.png")}
              alt={showPassword ? "Hide password" : "Show password"}
              style={{ width: "1.3rem", height: "1.3rem" }}
            />
          </button>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirm_password}
            onChange={e => setConfirm(e.target.value)}
            className="auth-input"
            required
            style={{ paddingRight: "2.5rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            style={{
              position: "absolute",
              right: "0.5rem",
              top: "40%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0
            }}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <img
              src={showPassword ? require("../../assets/hidden.png") : require("../../assets/eye.png")}
              alt={showPassword ? "Hide password" : "Show password"}
              style={{ width: "1.3rem", height: "1.3rem" }}
            />
          </button>
        </div>
        <button type="submit">Save New Password</button>
      </form>
    </div>
  );
};

export default ForceChangePassword;