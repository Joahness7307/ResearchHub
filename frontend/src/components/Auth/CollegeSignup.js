import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import openEyeIcon from "../../assets/openEyeIcon.png";
import closeEyeIcon from "../../assets/closeEyeIcon.png";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const CollegeSignup = () => {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    year_level: "",
    password: "",
    confirm_password: ""
  });

  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajorId, setSelectedMajorId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // Fetch departments on mount
  useEffect(() => {
    axios.get(API_ROUTES.academic.departments)
      .then(res => {
        setDepartments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load departments:", err);
        setError("Failed to load departments. Please try again later.");
        setLoading(false);
      });
  }, []);

  // When department selected → fetch blocks/majors dynamically
  useEffect(() => {
    if (!selectedDeptId) {
      setBlocks([]);
      setSelectedBlockId("");
      setMajors([]);
      setSelectedMajorId("");
      return;
    }

    const dept = departments.find(d => d.id === Number(selectedDeptId));
    if (!dept) return;

    // Fetch blocks if department has them
    if (dept.has_blocks) {
      axios.get(API_ROUTES.academic.blocks(selectedDeptId))
        .then(res => setBlocks(res.data))
        .catch(err => console.error("Failed to load blocks:", err));
    } else {
      setBlocks([]);
      setSelectedBlockId("");
    }

    // Fetch majors if department has them
    if (dept.has_majors) {
      axios.get(API_ROUTES.academic.majors(selectedDeptId))
        .then(res => setMajors(res.data))
        .catch(err => console.error("Failed to load majors:", err));
    } else {
      setMajors([]);
      setSelectedMajorId("");
    }
  }, [selectedDeptId, departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "department") {
      setSelectedDeptId(value);
      setSelectedBlockId("");   // Reset dependent fields
      setSelectedMajorId("");
    } else if (name === "block") {
      setSelectedBlockId(value);
    } else if (name === "major") {
      setSelectedMajorId(value);
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    const payload = {
      full_name: form.full_name,
      username: form.username,
      email: form.email,
      password: form.password,
      confirm_password: form.confirm_password,
      role: "student",
      department_id: selectedDeptId || null,
      block_id: selectedBlockId || null,
      major_id: selectedMajorId || null,
      year_level: form.year_level || null
    };

    try {
      await axios.post(API_ROUTES.auth.register, payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  const selectedDept = departments.find(d => d.id === Number(selectedDeptId));
  const showBlock = !!selectedDept?.has_blocks;
  const showMajor = !!selectedDept?.has_majors;

  if (loading) return <div className="auth-container">Loading departments...</div>;

  return (
    <div className="auth-container">
      <form className="auth-signup-form" onSubmit={handleSubmit}>
        <h2>College Student Signup</h2>
        <p className="subtext">Please fill in your information</p>
        {error && <div className="auth-error">{error}</div>}

        {/* Full Name, Username, Email */}
        <div className="auth-row">
          <div className="auth-col">
            <label className="auth-label" htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-col">
            <label className="auth-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-col">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>
        </div>

        {/* Department & Year Level */}
        <div className="auth-row">
          <div className="auth-col">
            <label className="auth-label" htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={selectedDeptId}
              onChange={handleChange}
              required
              className="auth-input"
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-col">
            <label className="auth-label" htmlFor="year_level">Year Level</label>
            <select
              id="year_level"
              name="year_level"
              value={form.year_level}
              onChange={handleChange}
              required
              className="auth-input"
            >
              <option value="">Select Year Level</option>
              {["1st", "2nd", "3rd", "4th"].map(yl => (
                <option key={yl} value={yl}>{yl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional: Block & Major */}
        <div className="auth-row">
          {showBlock && (
            <div className="auth-col">
              <label className="auth-label" htmlFor="block">Block</label>
              <select
                id="block"
                name="block"
                value={selectedBlockId}
                onChange={handleChange}
                required={showBlock}
                className="auth-input"
              >
                <option value="">Select Block</option>
                {blocks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
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
                value={selectedMajorId}
                onChange={handleChange}
                required={showMajor}
                className="auth-input"
              >
                <option value="">Select Major</option>
                {majors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Spacer */}
          {(!showBlock && !showMajor) && <div className="auth-col"></div>}
        </div>

        {/* Passwords */}
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
            className="password-toggle"
            onClick={() => setShowPassword(prev => !prev)}
          >
            <img src={showPassword ? openEyeIcon : closeEyeIcon} alt="" />
          </span>
        </div>

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
            className="password-toggle"
            onClick={() => setShowConfirm(prev => !prev)}
          >
            <img src={showConfirm ? openEyeIcon : closeEyeIcon} alt="" />
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

export default CollegeSignup;