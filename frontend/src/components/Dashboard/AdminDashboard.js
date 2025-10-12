// AdminDashboard.js (COMPLETED & FIXED for DOM Nesting Warnings)



import React, { useEffect, useState } from "react";

import axios from "../../api/axios";

import "./AdminDashboard.css"



const AdminDashboard = ({ activeSection }) => {

  const [projects, setProjects] = useState([]);

  const [users, setUsers] = useState([]);

  // ADDED: New state for Dashboard Counts

  const [counts, setCounts] = useState({ 

    totalUsers: 0, 

    totalProjects: 0,

    pending: 0,

    endorsed: 0,

    approved: 0,

    revision: 0,

  });

  

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



  // Fetch projects for project list/cards

  useEffect(() => {

    // Only run this when on the dashboard section or on initial mount

    if (activeSection === "dashboard" || activeSection === undefined) {

      axios.get("/projects/admin/all")

        .then(res => setProjects(res.data.projects || []))

        .catch(() => setProjects([]));

    }

    

    // FIX: Fetch total user count and project counts immediately on mount

    // Combined into one useEffect for cleaner code on initial dashboard load.

    if (activeSection === "dashboard" || activeSection === undefined) {

      // Fetch total user count

      axios.get("/users/count")

        .then(res => setCounts(prev => ({ ...prev, totalUsers: res.data.totalUsers || 0 })))

        .catch(err => console.error("Failed to fetch user count:", err));

      

      // Fetch project status counts

      axios.get("/projects/counts")

        .then(res => setCounts(prev => ({ ...prev, ...res.data })))

        .catch(err => console.error("Failed to fetch project counts:", err));

    }

    

    // The fetches are intentionally run here based on activeSection's initial state

    // or when it explicitly changes to "dashboard".

  }, [activeSection]); // Keep the dependency array to run when the section changes.





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

    setForm({ name: user.full_name, email: user.email, password: "", role: user.role });

  };



  const filteredUsers = users.filter(

    user =>

      (user.full_name && user.full_name.toLowerCase().includes(userSearch.toLowerCase())) ||

      (user.email && user.email.toLowerCase().includes(userSearch.toLowerCase()))

  );



  // Project status groups

  const pendingProjects = projects.filter(p => p.status === "pending" || p.status === "endorsed");

  const approvedProjects = projects.filter(p => p.status === "approved");

  const rejectedProjects = projects.filter(p => p.status === "rejected" || p.status === "need_revision" || p.status === "admin_revision");



  // Determine which section to show

  const section = activeSection || window.location.pathname.includes("manage-users") ? "users" : "dashboard";



  const handleInvite = async (e) => {

    e.preventDefault();

    setMsg(""); setError("");

    try {

      const token = localStorage.getItem("token");

      // This function seems redundant and should rely on handleInviteSubmit above

      console.log("Invite Adviser logic executed, usually handled by handleInviteSubmit.");

    } catch (err) {

      setError(err.response?.data?.message || "Failed to send invitation.");

    }

  };



  return (

    <>

      {section === "dashboard" && (

        <>

          {/* NEW: Top-level Count Cards */}

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

          

          {/* NEW: Project Status Breakdown */}

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

            {/* Removed the approved and rejected cards here to make room for summary and focus on the main list */}

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