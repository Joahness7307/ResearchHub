import React, { useState } from "react";

import axios from "../../api/axios";

import { useNavigate, Link } from "react-router-dom";
import eyeIcon from "../../assets/eye.png";
import hiddenIcon from "../../assets/hidden.png";

import "./AuthForm.css";



const GuestSignup = () => { // Renamed for clarity, assuming you use /register-user route

  const [form, setForm] = useState({

    full_name: "",

    username: "",

    email: "",

    password: "",

    confirm_password: ""

  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();



  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    

    // Client-side password check is optional now, as the server handles it first

    if (form.password !== form.confirm_password) {

      setError("Passwords do not match");

      return;

    }

    

    // Prepare data

    const dataToSend = { 

        ...form, 

        role: "guest" 

    };

    // 🛑 FIX: DO NOT DELETE confirm_password. Send it to the server.

    // delete dataToSend.confirm_password; // <--- REMOVED



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

        <h2>Guest Signup</h2>

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

        </div>



        <label className="auth-label" htmlFor="email">Email</label>

        <input id="email" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="auth-input" />

        {/* Password Field */}
        <label className="auth-label">Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="auth-input"
            style={{ paddingRight: "3.5rem" }}
          />
          <span
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(prev => !prev)}
          >
            <img src={showPassword ? eyeIcon : hiddenIcon} alt="" />
          </span>
        </div>

        {/* Confirm Password Field */}
        <label className="auth-label">Confirm Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            required
            className="auth-input"
            style={{ paddingRight: "3.5rem" }}
          />
          <span
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirm(prev => !prev)}
          >
            <img src={showConfirm ? eyeIcon : hiddenIcon} alt="" />
          </span>
        </div>

        <button type="submit">Signup</button>

        <div className="auth-switch">

          Already have an account? <Link to="/login">Login</Link>

        </div>

      </form>

    </div>

  );

};



export default GuestSignup;