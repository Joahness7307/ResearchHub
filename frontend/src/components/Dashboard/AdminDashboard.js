import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./AdminDashboard.css"

const AdminDashboard = ({ activeSection }) => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [editUserId, setEditUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [inviteForm, setInviteForm] = useState({
  email: "",
  role: "admin",
  type: "",
  department: "",
  strand: "",
});

const handleInviteChange = e => setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });

const handleInviteSubmit = async e => {
  e.preventDefault();
  setMsg(""); setError("");
  try {
    await axios.post("/users/invite-user", inviteForm);
    setMsg("Invitation sent!");
    setInviteForm({ email: "", role: "admin", type: "", department: "", strand: "" });
  } catch (err) {
    setError(err.response?.data?.message || "Failed to send invitation.");
  }
};

  // Fetch projects for dashboard
  useEffect(() => {
    axios.get("/projects/admin/all")
      .then(res => setProjects(res.data.projects || []))
      .catch(() => setProjects([]));
  }, []);

  // Fetch users for user management
  useEffect(() => {
    if (activeSection === "users") {
      axios.get("/users/all")
        .then(res => setUsers(res.data.users || []))
        .catch(() => setUsers([]));
    }
  }, [activeSection]);

  // User management handlers
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editUserId) {
        await axios.put(`/users/update/${editUserId}`, form);
        setMessage("User updated!");
      } else {
        await axios.post("/users/add", form);
        setMessage("User added!");
      }
      setForm({ name: "", email: "", password: "", role: "student" });
      setEditUserId(null);
    } catch (err) {
      setMessage("Error updating/adding user.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/users/delete/${id}`);
      setMessage("User deleted!");
      setUsers(users.filter(u => u.id !== id));
    } catch {
      setMessage("Error deleting user.");
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
  };

  const filteredUsers = users.filter(
    user =>
      (user.full_name && user.full_name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // Project status groups
  const pendingProjects = projects.filter(p => p.status === "pending");
  const approvedProjects = projects.filter(p => p.status === "approved");
  const rejectedProjects = projects.filter(p => p.status === "rejected");

  // Determine which section to show
  const section = activeSection || window.location.pathname.includes("manage-users") ? "users" : "dashboard";

  const handleInvite = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("/users/invite-research-adviser", { email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("Invitation sent!");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation.");
    }
  };

  return (
    <>
      {section === "dashboard" && (
        <>
          <h2 style={{ marginTop: '5rem' }}>Project Management</h2>
          <div className="dashboard-cards-row">
            <div className="dashboard-card">
              <h3>Pending Projects</h3>
              {pendingProjects.length === 0 ? (
                <div>No pending projects.</div>
              ) : (
                pendingProjects.map(p => (
                  <div key={p.id} className="dashboard-card-item">
                    <b>{p.title}</b>
                    <div>{p.category}</div>
                    <div>By: {p.authors}</div>
                    <a href={`/projects/${p.id}`}>View Details</a>
                  </div>
                ))
              )}
            </div>
            <div className="dashboard-card">
              <h3>Approved Projects</h3>
              {approvedProjects.length === 0 ? (
                <div>No approved projects.</div>
              ) : (
                approvedProjects.map(p => (
                  <div key={p.id} className="dashboard-card-item">
                    <b>{p.title}</b>
                    <div>{p.category}</div>
                    <div>By: {p.authors}</div>
                    <a href={`/projects/${p.id}`}>View Details</a>
                  </div>
                ))
              )}
            </div>
            <div className="dashboard-card">
              <h3>Rejected Projects</h3>
              {rejectedProjects.length === 0 ? (
                <div>No rejected projects.</div>
              ) : (
                rejectedProjects.map(p => (
                  <div key={p.id} className="dashboard-card-item">
                    <b>{p.title}</b>
                    <div>{p.category}</div>
                    <div>By: {p.authors}</div>
                    <a href={`/projects/${p.id}`}>View Details</a>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {section === "users" && (
        <section className="admin-section admin-users">
          <h3 style={{ marginTop: '5rem', marginBottom: '2rem', fontSize: '1.5rem' }}>User Management</h3>
        <form onSubmit={handleInviteSubmit} className="admin-form">
          <input name="email" type="email" placeholder="Invite Email" value={inviteForm.email} onChange={handleInviteChange} required />
          <select name="role" value={inviteForm.role} onChange={handleInviteChange}>
            <option value="admin">Admin</option>
            <option value="head_admin">Head Admin</option>
            <option value="research_adviser">Research Adviser</option>
          </select>
          {inviteForm.role === "research_adviser" && (
            <>
              <select name="type" value={inviteForm.type} onChange={handleInviteChange}>
                <option value="">Select Type</option>
                <option value="college">College</option>
                <option value="senior_high">Senior High</option>
              </select>
              {inviteForm.type === "college" && (
                <select name="department" value={inviteForm.department} onChange={handleInviteChange}>
                  <option value="">Select Department</option>
                  {["BSIT", "BSHM", "BEED", "BSED", "BPED", "BSENTREP"].map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              )}
              {inviteForm.type === "senior_high" && (
                <select name="strand" value={inviteForm.strand} onChange={handleInviteChange}>
                  <option value="">Select Strand</option>
                  {["ABM", "STEM", "TVL", "HUMSS"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </>
          )}
          <button type="submit" className="admin-btn">Send Invite</button>
          {msg && <div className="admin-message">{msg}</div>}
          {error && <div className="admin-message" style={{ color: "red" }}>{error}</div>}
        </form>

          {message && <div className="admin-message">{message}</div>}
          <div className="admin-list-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleEditUser(user)} className="admin-btn edit-btn">Edit</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="admin-btn delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
};

export default AdminDashboard;