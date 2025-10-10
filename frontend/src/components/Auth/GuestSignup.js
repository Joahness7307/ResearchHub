import React, { useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const UserSignup = () => {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    try {
      await axios.post("/users/register", {
        ...form,
        role: "guest"
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-signup-form" onSubmit={handleSubmit} style={{ marginTop: "7rem" }}>
        <h2>Guest Signup</h2>
        <p className="subtext">Please fill in your information</p>
        {error && <div className="auth-error">{error}</div>}

        <label className="auth-label" htmlFor="full_name">Full Name</label>
        <input id="full_name" name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required className="auth-input" />

        <label className="auth-label" htmlFor="username">Username</label>
        <input id="username" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="auth-input" />

        <label className="auth-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="auth-input" />

        <label className="auth-label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="auth-input" />

        <label className="auth-label" htmlFor="confirm_password">Confirm Password</label>
        <input id="confirm_password" name="confirm_password" type="password" placeholder="Confirm Password" value={form.confirm_password} onChange={handleChange} required className="auth-input" />

        <button type="submit">Signup</button>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default UserSignup;