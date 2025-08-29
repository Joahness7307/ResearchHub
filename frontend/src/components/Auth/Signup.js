import React, { useState } from "react";
import axios from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const departments = ["BSIT", "BSHM", "BSED", "BPED", "BSENTREP"];
const yearLevels = ["1", "2", "3", "4"];
const blocks = ["A", "B", "C", "D", "E"];
const genders = ["Male", "Female"];

const Signup = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    department: "",
    year_level: "",
    block: "",
    gender: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await axios.post("/users/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="subtext">Please fill in your information</p>
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-row">
          <div className="auth-col">
            <label className="auth-label" htmlFor="full_name">Full Name</label>
            <input id="full_name" name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required className="auth-input" />
          </div>
          <div className="auth-col">
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="auth-input" />
          </div>
        </div>

        <div className="auth-row">
          <div className="auth-col">
            <label className="auth-label" htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="auth-input"
            >
              <option value="">Select</option>
              {departments.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          <div className="auth-col">
            <label className="auth-label" htmlFor="year_level">Year Level</label>
            <select id="year_level" name="year_level" value={form.year_level} onChange={handleChange} required className="auth-input">
              <option value="">Select</option>
              {yearLevels.map(yl => <option key={yl} value={yl}>{yl}</option>)}
            </select>
          </div>
          <div className="auth-col">
            <label className="auth-label" htmlFor="block">Block</label>
            <select id="block" name="block" value={form.block} onChange={handleChange} required className="auth-input">
              <option value="">Select</option>
              {blocks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <label className="auth-label">Gender</label>
        <div className="auth-gender-row">
          {genders.map(g => (
            <label key={g} className="auth-radio-label">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={form.gender === g}
                onChange={handleChange}
                required
              />
              {g}
            </label>
          ))}
        </div>

        <label className="auth-label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="auth-input" />

        <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required className="auth-input" />

        <button type="submit">Signup</button>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;