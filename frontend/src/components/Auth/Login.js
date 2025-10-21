import React, { useState, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // NOTE: setEmail and setPassword states were redundant; using identifier/password states is correct.
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/users/login", { identifier, password });
      const { token, user } = res.data;
      login(user, token);
      navigate("/");   

      // If backend / user indicates force_password_change, send user to force-change page
      if (user && user.force_password_change) {
        navigate("/force-change-password");
        return;
      }
      
      // Determine navigation based on role
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
        default: // Includes 'student'
          navigate("/projects");
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        {/* <div style={{ textAlign: "right", marginBottom: "0.5rem" }}>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
        </div> */}
        <button type="submit">Login</button>
        <div className="auth-switch">
          Don't have an account? <Link to="/role-selection">Signup</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;