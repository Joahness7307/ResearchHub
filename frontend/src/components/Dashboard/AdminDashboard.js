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

    const [addUserForm, setAddUserForm] = useState({
        username: "",
        full_name: "",
        email: "",
        role: "admin",
        type: "",
        department: "",
        strand: "",
        password: "",
        confirm_password: ""
    });
    const [addUserMessage, setAddUserMessage] = useState("");
    const [addUserError, setAddUserError] = useState("");

    const [userSearch, setUserSearch] = useState("");
    const [editUserId, setEditUserId] = useState(null); 
    const [editForm, setEditForm] = useState({ full_name: "", email: "", role: "", password: "" }); 
    const [message, setMessage] = useState(""); 
    const [error, setError] = useState(""); 
    
    // 💡 NEW STATE FOR PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const USERS_PER_PAGE = 10;
    // ----------------------------

    // Handler functions
    const handleAddUserChange = e => {
        const { name, value } = e.target;
        setAddUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        setAddUserMessage(""); setAddUserError("");
        try {
            if (addUserForm.password !== addUserForm.confirm_password) {
                setAddUserError("Passwords do not match.");
                return;
            }

            // Build payload
            const payload = {
                username: addUserForm.username,
                full_name: addUserForm.full_name,
                email: addUserForm.email,
                password: addUserForm.password,
                role: addUserForm.role
            };
            if (addUserForm.role === "research_adviser") {
                payload.type = addUserForm.type;
                if (addUserForm.type === "college") payload.department = addUserForm.department;
                if (addUserForm.type === "senior_high") payload.strand = addUserForm.strand;
            }

            const response = await axios.post("/users/add", payload);
            setAddUserMessage(`User added successfully. Temporary Password: ${response.data.tempPassword || 'N/A'}`); // Assuming your server now returns tempPassword
            setAddUserForm({
                username: "",
                full_name: "",
                email: "",
                role: "admin",
                type: "",
                department: "",
                strand: "",
                password: "",
                confirm_password: ""
            });
            fetchUsers(); // refresh users list
        } catch (err) {
            setAddUserError(err.response?.data?.message || "Failed to add user.");
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
            setCurrentPage(1); // Reset page when switching to users section
        }
    }, [activeSection]);

    // User management handlers
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const updatePayload = { 
                full_name: editForm.full_name,
                email: editForm.email, 
                role: editForm.role 
            };

            // Only send password if it's not empty, which will trigger a password change on the backend
            if (editForm.password) {
                 updatePayload.password = editForm.password;
            }

            await axios.put(`/users/update/${editUserId}`, updatePayload);
            setMessage("User updated successfully!");
            setEditUserId(null);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Error updating user.");
        }
    };

const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        setMessage(""); // Use Message state for success/error of edit/delete actions
        setError("");
        try {
            await axios.delete(`/users/delete/${id}`);
            // Use setMessage for success
            setMessage("User deleted successfully!"); 
            fetchUsers(); // Refresh users list
            
            // Recalculate page to prevent empty last page
            if (filteredUsersOnPage.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (err) {
            // Use setError for error, which will be styled red
            setError(err.response?.data?.message || "Error deleting user."); 
        }
    };

    const handleEditUser = (user) => {
        setEditUserId(user.id);
        setEditForm({ full_name: user.full_name, email: user.email, role: user.role, password: "" }); 
    };

   // 💡 NEW HANDLER FOR SEARCH INPUT CHANGE
    const handleSearchChange = (e) => {
        setUserSearch(e.target.value);
        setCurrentPage(1); // Reset to the first page when the search term changes
    };

    // 💡 UPDATED FILTER LOGIC: includes full_name, email, role, and joined date
    const filteredUsers = users.filter(user => {
        const searchTerm = userSearch.toLowerCase();
        
        // 1. Check Full Name
        const nameMatch = user.full_name && user.full_name.toLowerCase().includes(searchTerm);
        
        // 2. Check Email
        const emailMatch = user.email && user.email.toLowerCase().includes(searchTerm);
        
        // 3. Check Role
        const roleMatch = user.role && user.role.toLowerCase().includes(searchTerm);
        
        // 4. Check Joined Date (formatted as locale date string)
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const dateMatch = joinedDate.includes(searchTerm); // Search based on the displayed format
        
        return nameMatch || emailMatch || roleMatch || dateMatch;
    });

    // 💡 PAGINATION CALCULATIONS
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const indexOfLastUser = currentPage * USERS_PER_PAGE;
    const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
    
    // Get users for the current page
    const filteredUsersOnPage = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Pagination handlers
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const pendingProjects = projects.filter(p => p.status === "pending" || p.status === "endorsed");
    const section = activeSection || window.location.pathname.includes("manage-users") ? "users" : "dashboard";

    return (
        <>
            {/* ... (Dashboard Section JSX remains the same) ... */}
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

                    <section style={{ marginTop: "2rem" }}>
                        <form onSubmit={handleAddUserSubmit} className="admin-form" style={{ gap: "0.75rem" }}>
                            <input name="username" placeholder="Username" value={addUserForm.username} onChange={handleAddUserChange} required />
                            <input name="full_name" placeholder="Full name" value={addUserForm.full_name} onChange={handleAddUserChange} required />
                            <input name="email" type="email" placeholder="Email" value={addUserForm.email} onChange={handleAddUserChange} required />

                            <select name="role" value={addUserForm.role} onChange={handleAddUserChange} required>
                                <option value="admin">Admin</option>
                                <option value="head_admin">Head Admin</option>
                                <option value="research_adviser">Research Adviser</option>
                                <option value="student">Student</option>
                                <option value="guest">Guest</option>
                            </select>

                            {/* Adviser extra fields */}
                            {addUserForm.role === "research_adviser" && (
                                <>
                                    <select name="type" value={addUserForm.type} onChange={handleAddUserChange} required>
                                        <option value="">Select Type</option>
                                        <option value="college">College</option>
                                        <option value="senior_high">Senior High</option>
                                    </select>

                                    {addUserForm.type === "college" && (
                                        <select name="department" value={addUserForm.department} onChange={handleAddUserChange} required>
                                            <option value="">Select Department</option>
                                            {["BSIT","BSHM","BEED","BSED","BPED","BSENTREP"].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    )}

                                    {addUserForm.type === "senior_high" && (
                                        <select name="strand" value={addUserForm.strand} onChange={handleAddUserChange} required>
                                            <option value="">Select Strand</option>
                                            {["ABM","STEM","TVL","HUMSS"].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    )}
                                </>
                            )}

                            <input name="password" type="password" placeholder="Password" value={addUserForm.password} onChange={handleAddUserChange} required />
                            <input name="confirm_password" type="password" placeholder="Confirm Password" value={addUserForm.confirm_password} onChange={handleAddUserChange} required />

                            <button type="submit" className="admin-btn">Add User</button>
                            {/* Display message with password */}
                            {addUserMessage && <div className="admin-message" style={{ color: "green", whiteSpace: "pre-wrap" }}>{addUserMessage}</div>}
                            {addUserError && <div className="admin-message" style={{ color: "red" }}>{addUserError}</div>}
                        </form>
                    </section>

                    {message && <div className="admin-message">{message}</div>}

                    {/* Edit User Modal/Form (JSX remains the same) */}
                    {editUserId && (
                        <div className="admin-edit-modal">
                            <form onSubmit={handleUserSubmit} className="admin-edit-form">
                                <h4>Edit User</h4>
                                <input name="full_name" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} placeholder="Full Name" required />
                                <input name="email" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email" required />
                                <select name="role" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                                    <option value="head_admin">Head Admin</option>
                                    <option value="admin">Admin</option>
                                    <option value="research_adviser">Research Adviser</option>
                                    <option value="student">Student</option>
                                    <option value="guest">Guest</option>
                                </select>
                                <button type="submit" className="admin-btn edit-btn">Save Changes</button>
                                <button type="button" onClick={() => setEditUserId(null)} className="admin-btn cancel-btn">Cancel</button>
                            </form>
                        </div>
                    )}

                    {/* 💡 NEW: Search Input and Button */}
                        <div className="admin-search-bar">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={handleSearchChange}
                                className="admin-search-input"
                            />
                            {/* Search is handled dynamically by onChange, but keeping a button for consistency/future features */}
                            <button className="admin-btn">
                                Search
                            </button>
                        </div>

                    <div className="admin-list-wrapper">
                        {/* 💡 Table now uses filteredUsersOnPage */}
                        <table className="admin-table">
                            <thead><tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr></thead>
                            <tbody>
                            {filteredUsersOnPage.length === 0 ? (
                                <tr><td colSpan="5">No users found.</td></tr>
                            ) : (
                                filteredUsersOnPage.map(user => (
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
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* 💡 PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', gap: '10px' }}>
                            <button 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1}
                                className="admin-btn"
                                style={{ background: '#6b7280' }}
                            >
                                Previous
                            </button>
                            <span style={{ alignSelf: 'center', color: '#3a3e92', fontWeight: 'bold' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                className="admin-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            )}
        </>
    );
};

export default AdminDashboard;