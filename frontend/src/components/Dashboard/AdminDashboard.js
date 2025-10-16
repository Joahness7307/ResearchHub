import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./AdminDashboard.css"

const AdminDashboard = ({ activeSection }) => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ 
    totalUsers: 0, 
    totalProjects: 0,
    pending: 0,
    endorsed: 0,
    approved: 0,
    revision: 0,
  });

  const [userSearch, setUserSearch] = useState("");
  const [editUserId, setEditUserId] = useState(null); 
  // FIX 6: Ensure full_name is used in state to match the server
  const [editForm, setEditForm] = useState({ full_name: "", email: "", role: "", password: "" }); 
  const [message, setMessage] = useState(""); 
  const [msg, setMsg] = useState(""); 
  const [error, setError] = useState(""); 

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "admin", // Default is Admin role
    type: "",
    department: "",
    strand: "",
  });

  const handleInviteChange = e => setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });

  const handleInviteSubmit = async e => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      // This sends the invitation for admin, head_admin, or adviser
      await axios.post("/users/invite-user", inviteForm);
      setMsg("Invitation sent!");
      setInviteForm({ email: "", role: "admin", type: "", department: "", strand: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation.");
    }
  };

  // ... (useEffect for projects and counts remains the same) ...
  useEffect(() => {
    if (activeSection === "dashboard" || activeSection === undefined) {
      axios.get("/projects/admin/all")
        .then(res => setProjects(res.data.projects || []))
        .catch(() => setProjects([]));
    }
    if (activeSection === "dashboard" || activeSection === undefined) {
      axios.get("/users/count")
        .then(res => setCounts(prev => ({ ...prev, totalUsers: res.data.totalUsers || 0 })))
        .catch(err => console.error("Failed to fetch user count:", err));

      axios.get("/projects/counts")
        .then(res => setCounts(prev => ({ ...prev, ...res.data })))
        .catch(err => console.error("Failed to fetch project counts:", err));
    }
  }, [activeSection]);

  // Fetch users for user management
  const fetchUsers = () => {
    axios.get("/users/all")
      .then(res => setUsers(res.data.users || []))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    if (activeSection === "users") {
      fetchUsers();
    }
  }, [activeSection]);

  // User management handlers
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      // FIX 7: Send the fields the server expects: name (mapped to full_name), email, role
      await axios.put(`/users/update/${editUserId}`, { 
        name: editForm.full_name, // Send as 'name' for controller
        email: editForm.email, 
        role: editForm.role 
      });
      setMessage("User updated!");
      setEditUserId(null); // Close modal/form
      fetchUsers(); // Re-fetch users
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating user.");
    }
  };

  const handleDeleteUser = async (id) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/users/delete/${id}`);
      setMessage("User deleted!");
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setMessage(err.response?.data?.message || "Error deleting user.");
    }
  };

  const handleEditUser = (user) => {
    // Open edit modal/form with user data
    setEditUserId(user.id);
    // FIX 8: Populate full_name for the edit form
    setEditForm({ full_name: user.full_name, email: user.email, role: user.role, password: "" }); 
  };

  const filteredUsers = users.filter(
    user =>
      (user.full_name && user.full_name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const pendingProjects = projects.filter(p => p.status === "pending" || p.status === "endorsed");
  // Determine which section to show
  const section = activeSection || window.location.pathname.includes("manage-users") ? "users" : "dashboard";

  return (
    <>
      {section === "dashboard" && (
        <>
          <div className="dashboard-summary-cards">
            <div className="summary-card total-projects">
              <h3>📚 Total Projects</h3>
              <p className="count-number">{counts.totalProjects}</p>
            </div>
            <div className="summary-card total-users">
              <h3>👥 Total Users</h3>
              <p className="count-number">{counts.totalUsers}</p>
            </div>
          </div>

          {/* Project Status Breakdown */}
          <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.8rem', color: '#3a3e92' }}>Project Status Summary</h2>
          <div className="dashboard-status-cards">
            <div className="status-card pending">
              <h3>Pending</h3>
              <p className="count-number">{counts.pending}</p>
            </div>
            <div className="status-card endorsed">
              <h3>Endorsed</h3>
              <p className="count-number">{counts.endorsed}</p>
            </div>
            <div className="status-card revision">
              <h3>Request for Revision</h3>
              <p className="count-number">{counts.revision}</p>
            </div>
            <div className="status-card approved">
              <h3>In Repository (Approved)</h3>
              <p className="count-number">{counts.approved}</p>
            </div>
          </div>

          <h2 style={{ marginTop: '5rem' }}>Pending Project List</h2>
          <div className="dashboard-cards-row">
            <div className="dashboard-card project-list-card">
              <h3>Pending Projects ({pendingProjects.length})</h3>
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
          </div>
        </>
      )}

      {section === "users" && (
        <section className="admin-section admin-users">
          <h3 style={{ marginTop: '5rem', marginBottom: '2rem', fontSize: '1.5rem' }}>User Management</h3>

          {/* Invite Form */}
        <form onSubmit={handleInviteSubmit} className="admin-form">
          <input name="email" type="email" placeholder="Invite Email" value={inviteForm.email} onChange={handleInviteChange} required />
          {/* FIX 9: Include Head Admin in the invite options */}
          <select name="role" value={inviteForm.role} onChange={handleInviteChange}>
            <option value="admin">Admin</option>
            <option value="head_admin">Head Admin</option>
            <option value="research_adviser">Research Adviser</option>
          </select>
          {/* Conditional fields for Research Adviser */}
          {inviteForm.role === "research_adviser" && (
            <>
              <select name="type" value={inviteForm.type} onChange={handleInviteChange} required>
                <option value="">Select Type</option>
                <option value="college">College</option>
                <option value="senior_high">Senior High</option>
              </select>
              {inviteForm.type === "college" && (
                <select name="department" value={inviteForm.department} onChange={handleInviteChange} required>
                  <option value="">Select Department</option>
                  {["BSIT", "BSHM", "BEED", "BSED", "BPED", "BSENTREP"].map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              )}
              {inviteForm.type === "senior_high" && (
                <select name="strand" value={inviteForm.strand} onChange={handleInviteChange} required>
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
        {/* End Invite Form */}
          {message && <div className="admin-message">{message}</div>}

          {/* Edit User Modal/Form */}
          {editUserId && (
            <div className="admin-edit-modal">
              <form onSubmit={handleUserSubmit} className="admin-edit-form">
                <h4>Edit User</h4>
                <input name="full_name" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} placeholder="Full Name" required />
                <input name="email" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email" required />
                {/* FIX 10: Include all roles in the edit dropdown */}
                <select name="role" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                  <option value="head_admin">Head Admin</option>
                  <option value="admin">Admin</option>
                  <option value="research_adviser">Research Adviser</option>
                  <option value="student">Student</option>
                  <option value="guest">Guest</option>
                </select>
                <button type="submit" className="admin-btn edit-btn">Save Changes</button>
                <button type="button" onClick={() => setEditUserId(null)} className="admin-btn delete-btn">Cancel</button>
              </form>
            </div>
          )}
          {/* End Edit User Modal/Form */}

          <div className="admin-list-wrapper">
            <table className="admin-table">
              <thead><tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr></thead>
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