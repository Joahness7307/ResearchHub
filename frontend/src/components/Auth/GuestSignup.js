import React, { useState } from "react";
import eyeIcon from "../../assets/eye.png";
import hiddenIcon from "../../assets/hidden.png";

import axios from "../../api/axios";

import { useNavigate, Link } from "react-router-dom";

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

        <label className="auth-label" htmlFor="password">Password</label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="auth-input"
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
              src={showPassword ? hiddenIcon : eyeIcon}
              alt={showPassword ? "Hide password" : "Show password"}
              style={{ width: "1.3rem", height: "1.3rem" }}
            />
          </button>
        </div>



        <label className="auth-label" htmlFor="confirm_password">Confirm Password</label>

       <div style={{ position: "relative" }}>
        <input
          id="confirm_password"
          name="confirm_password"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={form.confirm_password}
          onChange={handleChange}
          required
          className="auth-input"
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
            src={showPassword ? hiddenIcon : eyeIcon}
            alt={showPassword ? "Hide password" : "Show password"}
            style={{ width: "1.3rem", height: "1.3rem" }}
          />
        </button>
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