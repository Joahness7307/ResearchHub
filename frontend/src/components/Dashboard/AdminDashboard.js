import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [paperSearch, setPaperSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [editUserId, setEditUserId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("/users/all").then(res => setUsers(res.data.users || []));
    axios.get("/research/admin/all").then(res => setPapers(res.data.papers || []));
  }, [message]);

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
      setMessage(err.response?.data?.message || "Error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await axios.delete(`/users/delete/${id}`);
    setMessage("User deleted!");
  };

  const handleEditUser = (user) => {
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setEditUserId(user.id);
  };

  // Research management handlers
  const handleApprovePaper = async (id) => {
    await axios.post(`/research/admin/approve/${id}`);
    setMessage("Research paper approved!");
  };

  const handleRejectPaper = async (id) => {
    await axios.post(`/research/admin/reject/${id}`);
    setMessage("Research paper rejected!");
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm("Delete this research paper?")) return;
    await axios.delete(`/research/admin/delete/${id}`);
    setMessage("Research paper deleted!");
  };

  // Filtered lists
  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPapers = papers.filter(
    paper =>
      paper.title.toLowerCase().includes(paperSearch.toLowerCase()) ||
      paper.authors.toLowerCase().includes(paperSearch.toLowerCase())
  );

  // Status counts
  const pendingCount = papers.filter(p => p.status === "pending").length;
  const approvedCount = papers.filter(p => p.status === "approved").length;
  const rejectedCount = papers.filter(p => p.status === "rejected").length;

  return (
    <div className="admin-dashboard-outer">
      <div className="admin-dashboard-header">
        <h2>Admin Dashboard</h2>
      </div>
      <div className="admin-dashboard-tabs">
        <div
          className={`admin-tab-card ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <h3>👤 Manage Users</h3>
          <p>View, search, and manage all users.</p>
        </div>
        <div
          className={`admin-tab-card ${activeTab === "research" ? "active" : ""}`}
          onClick={() => setActiveTab("research")}
        >
          <h3>📄 Manage Research Uploads</h3>
          <p>Review, approve, or reject research uploads.</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && (
        <section className="admin-section admin-users">
          <div className="admin-management-header">
            <h3>User Management</h3>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>
          <form className="admin-form" onSubmit={handleUserSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder={editUserId ? "New Password (optional)" : "Password"}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required={!editUserId}
            />
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="admin-btn">{editUserId ? "Update User" : "Add User"}</button>
            {editUserId && (
              <button type="button" className="admin-btn cancel-btn" onClick={() => { setEditUserId(null); setForm({ name: "", email: "", password: "", role: "teacher" }); }}>
                Cancel
              </button>
            )}
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
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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

      {activeTab === "research" && (
        <section className="admin-section admin-papers">
          <div className="admin-management-header">
            <h3>Research Uploads Management</h3>
            <div className="admin-status-cards">
              <div className="status-card status-pending">
                <b>Pending</b>
                <div>{pendingCount}</div>
              </div>
              <div className="status-card status-approved">
                <b>Approved</b>
                <div>{approvedCount}</div>
              </div>
              <div className="status-card status-rejected">
                <b>Rejected</b>
                <div>{rejectedCount}</div>
              </div>
            </div>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search research by title or author..."
              value={paperSearch}
              onChange={e => setPaperSearch(e.target.value)}
            />
          </div>
          {message && <div className="admin-message">{message}</div>}
          <div className="admin-list-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Authors</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.map(paper => (
                  <tr key={paper.id}>
                    <td>{paper.title}</td>
                    <td>{paper.category}</td>
                    <td>{paper.authors}</td>
                    <td>
                      <span className={`admin-paper-status status-${paper.status}`}>{paper.status}</span>
                    </td>
                    <td>{new Date(paper.createdAt).toLocaleDateString()}</td>
                    <td>
                      {paper.status === "pending" && (
                        <>
                          <button onClick={() => handleApprovePaper(paper.id)} className="admin-btn approve-btn">Approve</button>
                          <button onClick={() => handleRejectPaper(paper.id)} className="admin-btn reject-btn">Reject</button>
                        </>
                      )}
                      <button onClick={() => handleDeletePaper(paper.id)} className="admin-btn delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;