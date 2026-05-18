import React, { useState, useContext } from "react";
import openEyeIcon from "../../assets/openEyeIcon.png";
import closeEyeIcon from "../../assets/closeEyeIcon.png";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(API_ROUTES.auth.login, { identifier, password });
      const { token, user } = res.data;
      login(user, token);

      if (user && user.force_password_change) {
        navigate("/force-change-password");
        return;
      }

      switch (user.role) {
        case "admin": navigate("/admin"); break;
        case "head_admin": navigate("/head-admin"); break;
        case "guest": navigate("/dashboard"); break;
        case "research_adviser": navigate("/adviser"); break;
        default: navigate("/dashboard"); break;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="subtext">Start your research journey now!</p>
        {error && <div className="auth-error">{error}</div>}
        <input
          type="text"
          placeholder="Email or Username"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
          className="auth-input"
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="auth-input"
            style={{ paddingRight: "3.5rem" }}
          />
          <span
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <img src={showPassword ? openEyeIcon : closeEyeIcon} alt="" />
          </span>
        </div>
        <button type="submit">Login</button>
        <div className="auth-switch">
          Don't have an account? <Link to="/role-selection">Signup</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;