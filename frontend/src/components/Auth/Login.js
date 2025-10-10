import React, { useState, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/users/login", { identifier, password });
      const { token, user } = res.data;
      login(user, token);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "head_admin") navigate("/head-admin");
      else if (user.role === "guest") navigate("/guest");
      else if (user.role === "research_adviser") navigate("/adviser");
      else navigate("/projects");
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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <div style={{ textAlign: "right", marginBottom: "0.5rem" }}>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
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