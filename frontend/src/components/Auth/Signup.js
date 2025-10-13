import React, { useState } from "react";

import axios from "../../api/axios";

import { useNavigate, Link } from "react-router-dom";

import "./AuthForm.css";



const departments = ["BSIT", "BSHM", "BSENTREP", "BEED", "BSED", "BPED"];

const yearLevels = ["1st", "2nd", "3rd", "4th"];

const blocksByDept = {

  BSIT: ["A", "B", "C", "D"],

  BSHM: ["A", "B", "C"]

};

const majors = ["English", "Math", "Science"];



const CollegeSignup = () => { // Renamed for clarity, assuming you use /register route

  const [form, setForm] = useState({

    full_name: "",

    username: "",

    email: "",

    department: "",

    year_level: "",

    block: "",

    major: "",

    password: "",

    confirm_password: ""

  });

  const [error, setError] = useState("");

  const navigate = useNavigate();



  // Dynamic field rendering logic

  const showBlock = form.department === "BSIT" || form.department === "BSHM";

  const showMajor = form.department === "BSED";

  const blocks = blocksByDept[form.department] || [];



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

    

    // Send everything, including confirm_password

    const dataToSend = { ...form, role: "student" }; 



    // Handle conditional fields (remove null or irrelevant keys)

    if (!showBlock) {

      delete dataToSend.block; 

    }

    

    if (!showMajor) {

      delete dataToSend.major; 

    }

    

    // Remove fields for Senior High

    delete dataToSend.strand;

    delete dataToSend.grade_level;

    

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

        <h2>College Student Signup</h2>

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

        </div>



        <div className="auth-row">

          {showBlock && (

            <div className="auth-col">

              <label className="auth-label" htmlFor="block">Block</label>

              <select

                id="block"

                name="block"

                value={form.block}

                onChange={handleChange}

                required

                className="auth-input"

              >

                <option value="">Select</option>

                {blocks.map(b => (

                  <option key={b} value={b}>{b}</option>

                ))}

              </select>

            </div>

          )}



          {showMajor && (

            <div className="auth-col">

              <label className="auth-label" htmlFor="major">Major</label>

              <select

                id="major"

                name="major"

                value={form.major}

                onChange={handleChange}

                required

                className="auth-input"

              >

                <option value="">Select</option>

                {majors.map(m => (

                  <option key={m} value={m}>{m}</option>

                ))}

              </select>

            </div>

          )}

          

          {((showBlock && !showMajor) || (showMajor && !showBlock)) && <div className="auth-col"></div>}

          

          {(!showBlock && !showMajor) && (

            <>

              <div className="auth-col"></div>

              <div className="auth-col"></div>

            </>

          )}

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



export default CollegeSignup; // Updated export name