import React, { useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const strands = ["ABM", "HUMSS", "STEM", "TVL"];
const grade_levels = ["11", "12"]; // <-- Fix here

const SeniorHighSignup = () => {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    strand: "",
    grade_level: "",
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
    if (
      !form.full_name ||
      !form.username ||
      !form.email ||
      !form.strand ||
      !form.grade_level ||
      !form.password ||
      !form.confirm_password
    ) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    try {
      await axios.post("/users/register", {
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        strand: form.strand,
        grade_level: form.grade_level,
        password: form.password,
        confirm_password: form.confirm_password,
        role: "student"
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-signup-form" onSubmit={handleSubmit}>
        <h2>Senior High Signup</h2>
        <p className="subtext">Please fill in your information</p>
        {error && <div className="auth-error">{error}</div>}

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required className="auth-input" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="username">Username</label>
            <input id="username" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="auth-input" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="auth-input" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="strand">Strand</label>
            <select id="strand" name="strand" value={form.strand} onChange={handleChange} required className="auth-input">
              <option value="">Select</option>
              {strands.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="grade_level">Grade Level</label>
            <select id="grade_level" name="grade_level" value={form.grade_level} onChange={handleChange} required className="auth-input">
              <option value="">Select</option>
              {grade_levels.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

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

export default SeniorHighSignup;