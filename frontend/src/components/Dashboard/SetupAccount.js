import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./SetupAccount.css";

const departments = ["BSIT", "BSHM", "BEED", "BSED", "BPED", "BSENTREP"];
const strands = ["ABM", "STEM", "TVL", "HUMSS"];

const SetupAccount = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: "",
    confirm_password: "",
    department: "",
    strand: "",
    type: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/users/invitation-info?token=${token}`)
      .then(res => setInvite(res.data.invitation))
      .catch(() => setInvite(null));
  }, [token]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      await axios.post("/users/setup-account", { token, ...form });
      setMsg("Account setup successful! You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to setup account.");
    }
  };

  if (!invite) return <div className="setup-account-container">Invalid or expired invitation.</div>;

  // Dynamic fields based on role/type
  const isAdviser = invite.role === "research_adviser";
  const isCollegeAdviser = isAdviser && invite.type === "college";
  const isSeniorHighAdviser = isAdviser && invite.type === "senior_high";

  return (
    <div className="setup-account-container">
      <form className="setup-account-form" onSubmit={handleSubmit}>
        <h2>Setup Your {invite.role.replace("_", " ")} Account</h2>
        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
          className="setup-input"
        />
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="setup-input"
        />
        <input
          name="email"
          value={invite.email}
          readOnly
          className="setup-input"
        />
        {isAdviser && (
          <>
            <select
              name="type"
              value={form.type || invite.type}
              onChange={handleChange}
              required
              className="setup-input"
              disabled={!!invite.type}
            >
              <option value="">Select Type</option>
              <option value="college">College</option>
              <option value="senior_high">Senior High</option>
            </select>
            {isCollegeAdviser && (
              <select
                name="department"
                value={form.department || invite.department}
                onChange={handleChange}
                required
                className="setup-input"
                disabled={!!invite.department}
              >
                <option value="">Select Department</option>
                {departments.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            )}
            {isSeniorHighAdviser && (
              <select
                name="strand"
                value={form.strand || invite.strand}
                onChange={handleChange}
                required
                className="setup-input"
                disabled={!!invite.strand}
              >
                <option value="">Select Strand</option>
                {strands.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </>
        )}
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="setup-input"
        />
        <input
          name="confirm_password"
          type="password"
          placeholder="Confirm Password"
          value={form.confirm_password}
          onChange={handleChange}
          required
          className="setup-input"
        />
        <button type="submit" className="setup-btn">Setup Account</button>
        {msg && <div className="setup-success">{msg}</div>}
        {error && <div className="setup-error">{error}</div>}
      </form>
    </div>
  );
};

export default SetupAccount;