import React, { useState, useContext } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import openEyeIcon from "../../assets/openEyeIcon.png";
import closeEyeIcon from "../../assets/closeEyeIcon.png";
import "./AuthForm.css";

const ForceChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm] = useState("");
  
  // Independent toggles!
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  React.useEffect(() => {
    if (user && !user.force_password_change) {
      const routes = {
        admin: "/admin",
        head_admin: "/head-admin",
        guest: "/guest",
        research_adviser: "/adviser",
        student: "/projects"
      };
      navigate(routes[user.role] || "/projects");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setMsg("");
    
    if (!password || !confirm_password) return setError("Both fields are required.");
    if (password !== confirm_password) return setError("Passwords do not match.");

    try {
      await axios.post(API_ROUTES.auth.forceChangePassword, { password, confirm_password });
      setMsg("Password changed successfully! Redirecting...");
      setTimeout(() => { 
        logout(); 
        navigate("/login"); 
      }, 1500);
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

        {/* NEW PASSWORD FIELD */}
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowPassword(prev => !prev)}
          >
            <img
              src={showPassword ? openEyeIcon : closeEyeIcon}
              alt={showPassword ? "Hide" : "Show"}
            />
          </span>
        </div>

        {/* CONFIRM PASSWORD FIELD */}
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirm_password}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="auth-input"
          />
          <span
            className="password-toggle-icon"
            onClick={() => setShowConfirmPassword(prev => !prev)}
          >
            <img
              src={showConfirmPassword ? openEyeIcon : closeEyeIcon}
              alt={showConfirmPassword ? "Hide" : "Show"}
            />
          </span>
        </div>

        <button type="submit" className="auth-btn">
          Save New Password
        </button>
      </form>
    </div>
  );
};

export default ForceChangePassword;