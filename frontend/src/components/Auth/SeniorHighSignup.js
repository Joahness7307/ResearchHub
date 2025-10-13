import React, { useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const strands = ["ABM", "HUMSS", "STEM", "TVL"];
const grade_levels = ["11", "12"];

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
    
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    
    // Prepare data
    const dataToSend = { 
      full_name: form.full_name,
      username: form.username,
      email: form.email,
      strand: form.strand,
      grade_level: form.grade_level,
      password: form.password,
      role: "student" 
    };

    // Remove fields for College, just to be safe (though server should ignore)
    delete dataToSend.department;
    delete dataToSend.year_level;
    delete dataToSend.block;
    delete dataToSend.major;

    try {
      await axios.post("/users/register", dataToSend);
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

        <div className="auth-row">
          <div className="auth-col">
            <label className="auth-label" htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required className="auth-input" />
          </div>
          <div className="auth-col">
            <label className="auth-label" htmlFor="username">Username</label>
            <input id="username" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="auth-input" />
          </div>
          <div className="auth-col">
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="auth-input" />
          </div>
        </div>

        <div className="auth-row">
          <div className="auth-col">
            <label className="auth-label" htmlFor="strand">Strand</label>
            <select id="strand" name="strand" value={form.strand} onChange={handleChange} required className="auth-input">
              <option value="">Select</option>
              {strands.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="auth-col">
            <label className="auth-label" htmlFor="grade_level">Grade Level</label>
            <select id="grade_level" name="grade_level" value={form.grade_level} onChange={handleChange} required className="auth-input">
              <option value="">Select</option>
              {grade_levels.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {/* Empty col for consistent 3-column layout (or 2-column on mobile via CSS) */}
          <div className="auth-col"></div>
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