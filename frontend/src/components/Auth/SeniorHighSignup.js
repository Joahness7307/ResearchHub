import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import openEyeIcon from "../../assets/icons/open-eye-icon.png";
import closeEyeIcon from "../../assets/icons/close-eye-icon.png";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";

const SeniorHighSignup = () => {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    grade_level: "",
    password: "",
    confirm_password: ""
  });

  const [strands, setStrands] = useState([]);
  const [selectedStrandId, setSelectedStrandId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // Fetch strands on mount
  useEffect(() => {
    axios.get(API_ROUTES.academic.strands)
      .then(res => {
        setStrands(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load strands:", err);
        setError("Failed to load strands. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "strand") {
      setSelectedStrandId(value);
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
      strand_id: selectedStrandId || null,
      grade_level: form.grade_level || null
    };

    try {
      await axios.post(API_ROUTES.auth.register, payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) return <div className="auth-container">Loading strands...</div>;

  return (
    <div className="auth-container">
      <form className="auth-signup-form" onSubmit={handleSubmit}>
        <h2>Senior High Signup</h2>
        <p className="subtext">Please fill in your information</p>
        {error && <div className="auth-error">{error}</div>}

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

        <div className="auth-row">
          <div className="auth-col">
            <label className="auth-label" htmlFor="strand">Strand</label>
            <select
              id="strand"
              name="strand"
              value={selectedStrandId}
              onChange={handleChange}
              required
              className="auth-input"
            >
              <option value="">Select Strand</option>
              {strands.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-col">
            <label className="auth-label" htmlFor="grade_level">Grade Level</label>
            <select
              id="grade_level"
              name="grade_level"
              value={form.grade_level}
              onChange={handleChange}
              required
              className="auth-input"
            >
              <option value="">Select Grade Level</option>
              {["11", "12"].map(gl => (
                <option key={gl} value={gl}>{gl}</option>
              ))}
            </select>
          </div>

          <div className="auth-col"></div>
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

export default SeniorHighSignup;