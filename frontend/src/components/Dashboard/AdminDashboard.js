import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import eyeIcon from "../../assets/eye.png";
import hiddenIcon from "../../assets/hidden.png";
import "./AdminDashboard.css"
import UserRolePieChart from "../UserRolePieChart";
import ProjectStatusPieChart from "../ProjectStatusPieChart";
import { AuthContext } from "../../context/AuthContext";

const USERS_PER_PAGE = 10;
const PROJECTS_PER_PAGE = 10;

const AdminDashboard = ({ activeSection }) => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
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
    const [showAddUserPassword, setShowAddUserPassword] = useState(false);
    const [showAddUserConfirm, setShowAddUserConfirm] = useState(false);

    const [userSearch, setUserSearch] = useState("");
    const [editUserId, setEditUserId] = useState(null); 
    const [editForm, setEditForm] = useState({ full_name: "", email: "", role: "", password: "" }); 
    const [message, setMessage] = useState(""); 
    const [error, setError] = useState(""); 
    
    // 💡 NEW STATE FOR PAGINATION
    const [currentPage, setCurrentPage] = useState(1);

    // ✅ NEW: PROJECT MANAGEMENT STATES (ADDED)
    const [projectSearch, setProjectSearch] = useState("");
    const [projectPage, setProjectPage] = useState(1);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectsError, setProjectsError] = useState("");
    const [bookmarkLoading, setBookmarkLoading] = useState({});
    // Toggle bookmark handler for admin
    const handleBookmarkToggle = async (e, projectId, bookmarked) => {
        e.stopPropagation();
        if (!user) {
            alert("You must be logged in to bookmark projects.");
            return;
        }
        setBookmarkLoading(prev => ({ ...prev, [projectId]: true }));
        try {
            if (bookmarked) {
                await axios.delete(`/bookmarks/${projectId}`);
            } else {
                await axios.post(`/bookmarks/${projectId}`);
            }
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, bookmarked: !bookmarked } : p
            ));
        } catch (err) {
            alert("Failed to update bookmark. Please try again.");
        }
        setBookmarkLoading(prev => ({ ...prev, [projectId]: false }));
    };

    useEffect(() => {
        if (user && user.force_password_change) {
        navigate("/force-change-password");
        }
    }, [user, navigate]);

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
            setAddUserMessage(`User added successfully with temporary password`);
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
    
    // ✅ NEW: FETCH PROJECTS FUNCTION (ADDED)
    const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setProjectsError("");
    try {
        const res = await axios.get("/projects/admin/all");
        // backend returns an array; handle both shapes just in case
        setProjects(Array.isArray(res.data) ? res.data : res.data.projects || []);
    } catch (err) {
        console.error("fetchProjects failed:", err);
        setProjectsError("Failed to load projects.");
        setProjects([]);
    } finally {
        setLoadingProjects(false);
    }
    }, []);

    // ✅ NEW: DELETE PROJECT FUNCTION (ADDED)
    const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    try {
        await axios.delete(`/projects/admin/delete/${id}`);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        axios.get("/projects/counts")
        .then(res => setCounts(prev => ({ ...prev, ...res.data })))
        .catch(err => console.error("Failed to fetch project counts:", err));
    } catch (err) {
        console.error("delete project error", err);
        alert(`Failed to delete project: ${err.response?.data?.error || "Unknown error"}`);
    }
    };

    // ... (useEffect for projects and counts - UPDATED)
    useEffect(() => {
        if (activeSection === "dashboard" || activeSection === undefined) {
            axios.get("/projects/admin/all")
                .then(res => setProjects(res.data.projects || []))
                .catch(() => setProjects([]));
            
            // ✅ NEW: Fetch projects for project management
            fetchProjects();
        }
        if (activeSection === "dashboard" || activeSection === undefined) {
            axios.get("/users/count")
                .then(res => setCounts(prev => ({ ...prev, totalUsers: res.data.totalUsers || 0 })))
                .catch(err => console.error("Failed to fetch user count:", err));

            axios.get("/projects/counts")
                .then(res => setCounts(prev => ({ ...prev, ...res.data })))
                .catch(err => console.error("Failed to fetch project counts:", err));

            // Fetch all users for the chart
            fetchUsers();
        }
    }, [activeSection, fetchProjects]);

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
        // ✅ NEW: Fetch projects when switching to projects section
        if (activeSection === "projects") {
            fetchProjects();
            setProjectPage(1);
        }
    }, [activeSection, fetchProjects]);

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
        setMessage("");
        setError("");
        try {
            await axios.delete(`/users/delete/${id}`);
            setMessage("User deleted successfully!"); 
            fetchUsers();
            
            if (filteredUsersOnPage.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting user."); 
        }
    };

    const handleEditUser = (user) => {
        setEditUserId(user.id);
        setEditForm({ full_name: user.full_name, email: user.email, role: user.role, password: "" }); 
    };

    // 💡 HANDLER FOR SEARCH INPUT CHANGE
    const handleSearchChange = (e) => {
        setUserSearch(e.target.value);
        setCurrentPage(1);
    };

    // ✅ NEW: PROJECT SEARCH HANDLER (ADDED)
    const handleProjectSearchChange = (e) => {
        setProjectSearch(e.target.value);
        setProjectPage(1);
    };

    // 💡 UPDATED FILTER LOGIC: includes full_name, email, role, and joined date
    const filteredUsers = users.filter(user => {
        const searchTerm = userSearch.toLowerCase();
        
        const nameMatch = user.full_name && user.full_name.toLowerCase().includes(searchTerm);
        const emailMatch = user.email && user.email.toLowerCase().includes(searchTerm);
        const roleMatch = user.role && user.role.toLowerCase().includes(searchTerm);
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const dateMatch = joinedDate.includes(searchTerm);
        
        return nameMatch || emailMatch || roleMatch || dateMatch;
    });

    // PAGINATION CALCULATIONS
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const indexOfLastUser = currentPage * USERS_PER_PAGE;
    const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
    const filteredUsersOnPage = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // ✅ NEW: PROJECTS FILTERING + PAGINATION (ADDED)
    const filteredProjects = useMemo(() => {
        const term = (projectSearch || "").toLowerCase();
        if (!term) return projects;
        return projects.filter((p) => {
            return (
                (p.title && p.title.toLowerCase().includes(term)) ||
                (p.category && p.category.toLowerCase().includes(term)) ||
                (p.authors && p.authors.toLowerCase().includes(term)) ||
                (p.abstract && p.abstract.toLowerCase().includes(term))
            );
        });
    }, [projects, projectSearch]);

    const totalProjectPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE));
    const projectStart = (projectPage - 1) * PROJECTS_PER_PAGE;
    const paginatedProjects = filteredProjects.slice(projectStart, projectStart + PROJECTS_PER_PAGE);

    // Pagination handlers
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // ✅ NEW: PROJECT PAGINATION HANDLERS (ADDED)
    const paginateProjects = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalProjectPages) {
            setProjectPage(pageNumber);
        }
    };

    const pendingProjects = projects.filter(p => p.status === "pending" || p.status === "endorsed");
    const section = activeSection || "dashboard";

    return (
        <>
            {/* DASHBOARD SECTION (UNCHANGED) */}
            {section === "dashboard" && (
                <>
                <div className="admin-dashboard-header">
                    <h1 className="admin-dashboard-title">Admin Dashboard</h1>
                </div>
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

                    <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.5rem', color: '#3a3e92' }}>Project Status Summary</h2>
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
                            <h3>Approved</h3>
                            <p className="count-number">{counts.approved}</p>
                        </div>
                    </div>

                    <div className="charts-section">
                        <div className="chart-container">
                            <h2 style={{ fontSize: '1.5rem', color: '#3a3e92' }}>User Role Distribution</h2>
                            <div className="chart-container-wrapper">
                                <UserRolePieChart users={users} />
                            </div>
                        </div>
                        <div className="chart-container">
                            <h2 style={{ fontSize: '1.5rem', color: '#3a3e92' }}>Project Status Distribution</h2>
                            <div className="chart-container-wrapper">
                                <ProjectStatusPieChart counts={counts} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* USERS SECTION (UNCHANGED) */}
            {section === "users" && (
                <section className="admin-section admin-users">
                    <h3 style={{ marginTop: '3rem', marginBottom: '2rem', fontSize: '1.8rem' }}>User Management</h3>

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

                           {/* PASSWORD FIELD */}
                            <div className="password-input-wrapper">
                                <input
                                    name="password"
                                    type={showAddUserPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={addUserForm.password}
                                    onChange={handleAddUserChange}
                                    required
                                    className="admin-form-input"
                                />
                                <span
                                    className="password-toggle-icon"
                                    onClick={() => setShowAddUserPassword(prev => !prev)}
                                >
                                    <img
                                        src={showAddUserPassword ? eyeIcon : hiddenIcon}
                                        alt={showAddUserPassword ? "Hide" : "Show"}
                                    />
                                </span>
                            </div>

                            {/* CONFIRM PASSWORD FIELD */}
                            <div className="password-input-wrapper">
                                <input
                                    name="confirm_password"
                                    type={showAddUserConfirm ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={addUserForm.confirm_password}
                                    onChange={handleAddUserChange}
                                    required
                                    className="admin-form-input"
                                />
                                <span
                                    className="password-toggle-icon"
                                    onClick={() => setShowAddUserConfirm(prev => !prev)}
                                >
                                    <img
                                        src={showAddUserConfirm ? eyeIcon : hiddenIcon}
                                        alt={showAddUserConfirm ? "Hide" : "Show"}
                                    />
                                </span>
                            </div>

                            <button type="submit" className="admin-btn">Add User</button>
                            {addUserMessage && <div className="admin-message" style={{ color: "green", whiteSpace: "pre-wrap" }}>{addUserMessage}</div>}
                            {addUserError && <div className="admin-message" style={{ color: "red" }}>{addUserError}</div>}
                        </form>
                    </section>

                    {message && <div className="admin-message">{message}</div>}

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

                    <div className="admin-search-bar">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={handleSearchChange}
                            className="admin-search-input"
                        />
                        <button className="admin-btn">Search</button>
                    </div>

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
                            {filteredUsersOnPage.length === 0 ? (
                                <tr><td colSpan="5">No users found.</td></tr>
                            ) : (
                                filteredUsersOnPage.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.full_name}</td>
                                        <td>{user.email}</td>
                                        <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
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

            {/* ✅ NEW: PROJECTS SECTION (ADDED) */}
            {section === "projects" && (
                <section className="admin-section">
                    <h3 style={{ marginTop: '3rem', marginBottom: '2rem', fontSize: '1.8rem' }}>Project Management</h3>

                    <div className="admin-search-bar" style={{ margin: "1rem 0 1.5rem 0" }}>
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="Search projects by title, category, author or abstract..."
                            value={projectSearch}
                            onChange={handleProjectSearchChange}
                        />
                        <button className="admin-btn" onClick={() => setProjectPage(1)}>Search</button>
                    </div>

                    {loadingProjects ? (
                        <div>Loading projects...</div>
                    ) : projectsError ? (
                        <div style={{ color: "red" }}>{projectsError}</div>
                    ) : (
                        <>
                            <div className="admin-list-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Authors</th>
                                            <th>Submitted By</th>
                                            <th>Status</th>
                                            <th>Uploaded</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProjects.length === 0 ? (
                                            <tr><td colSpan="7" style={{ textAlign: "center", padding: "1.5rem" }}>No projects found.</td></tr>
                                        ) : (
                                            paginatedProjects.map((p) => (
                                                <tr key={p.id}>
                                                    <td style={{ maxWidth: 300, position: 'relative' }}>
                                                        {p.title}
                                                    </td>
                                                    <td>{p.category}</td>
                                                    <td>{p.authors}</td>
                                                    <td>{p.submitter?.full_name || p.submitter?.username || p.submitted_by}</td>
                                                    <td>{p.status}</td>
                                                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <button 
                                                            className="admin-btn" 
                                                            onClick={() => navigate(`/admin/projects/${p.id}`)}
                                                        >
                                                            View
                                                        </button>
                                                        <button 
                                                            className="admin-btn delete-btn"
                                                            onClick={() => handleDeleteProject(p.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalProjectPages > 1 && (
                                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', gap: '10px' }}>
                                    <button 
                                        onClick={() => paginateProjects(projectPage - 1)} 
                                        disabled={projectPage === 1}
                                        className="admin-btn"
                                        style={{ background: '#6b7280' }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ alignSelf: 'center', color: '#3a3e92', fontWeight: 'bold' }}>
                                        Page {projectPage} of {totalProjectPages}
                                    </span>
                                    <button 
                                        onClick={() => paginateProjects(projectPage + 1)} 
                                        disabled={projectPage === totalProjectPages}
                                        className="admin-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </>
    );
};

export default AdminDashboard;