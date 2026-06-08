import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import openEyeIcon from "../../assets/icons/open-eye-icon.png";
import closeEyeIcon from "../../assets/icons/close-eye-icon.png";
import "./AdminDashboard.css";
import UserRolePieChart from "../UserRolePieChart";
import ProjectStatusPieChart from "../ProjectStatusPieChart";
import { AuthContext } from "../../context/AuthContext";

const USERS_PER_PAGE = 10;
const PROJECTS_PER_PAGE = 10;

const AdminDashboard = ({ activeSection }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Existing States (Users & Projects) ──
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
    department_id: "",
    strand_id: "",
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

  const [currentPage, setCurrentPage] = useState(1);

  const [projectSearch, setProjectSearch] = useState("");
  const [projectPage, setProjectPage] = useState(1);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  // ── Shared Academic Data (used in both Academic Settings & Manage Users) ──
  const [departments, setDepartments] = useState([]);
  const [strands, setStrands] = useState([]);

  // ── Academic Settings States ──
  const [activeAcademicTab, setActiveAcademicTab] = useState("departments");

  // Departments CRUD states
  const [newDept, setNewDept] = useState({ name: "", has_blocks: false, has_majors: false });
  const [editDeptId, setEditDeptId] = useState(null);
  const [editDeptForm, setEditDeptForm] = useState({ name: "", has_blocks: false, has_majors: false });

  // Blocks CRUD states
  const [selectedDeptForBlocks, setSelectedDeptForBlocks] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [newBlock, setNewBlock] = useState({ name: "" });
  const [editBlockId, setEditBlockId] = useState(null);
  const [editBlockForm, setEditBlockForm] = useState({ name: "" });

  // Majors CRUD states
  const [selectedDeptForMajors, setSelectedDeptForMajors] = useState("");
  const [majors, setMajors] = useState([]);
  const [newMajor, setNewMajor] = useState({ name: "" });
  const [editMajorId, setEditMajorId] = useState(null);
  const [editMajorForm, setEditMajorForm] = useState({ name: "" });

  // Strands CRUD states
  const [newStrand, setNewStrand] = useState({ name: "" });
  const [editStrandId, setEditStrandId] = useState(null);
  const [editStrandForm, setEditStrandForm] = useState({ name: "" });

  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicError, setAcademicError] = useState("");

  // ── Fetch Shared Academic Data ──
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get(API_ROUTES.academic.getDepartments);
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setAcademicError("Failed to load departments");
    }
  }, []);

  const fetchStrands = useCallback(async () => {
    try {
      const res = await axios.get(API_ROUTES.academic.getStrands);
      setStrands(res.data);
    } catch (err) {
      console.error("Failed to load strands:", err);
      setAcademicError("Failed to load strands");
    }
  }, []);

  // Load shared data once on mount + refresh after academic changes
  useEffect(() => {
    fetchDepartments();
    fetchStrands();
  }, [fetchDepartments, fetchStrands]);

  // ── Academic Fetch Functions (for dependent data) ──
  const fetchBlocks = async (deptId) => {
    if (!deptId) return;
    setAcademicLoading(true);
    try {
      const res = await axios.get(API_ROUTES.academic.getBlocksByDepartment(deptId));
      setBlocks(res.data);
    } catch (err) {
      setAcademicError("Failed to load blocks");
    } finally {
      setAcademicLoading(false);
    }
  };

  const fetchMajors = async (deptId) => {
    if (!deptId) return;
    setAcademicLoading(true);
    try {
      const res = await axios.get(API_ROUTES.academic.getMajorsByDepartment(deptId));
      setMajors(res.data);
    } catch (err) {
      setAcademicError("Failed to load majors");
    } finally {
      setAcademicLoading(false);
    }
  };

  // ── Academic CRUD Handlers (with real-time refresh) ──
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_ROUTES.academic.createDepartment, newDept);
      setDepartments([...departments, res.data]); // Real-time update
      setNewDept({ name: "", has_blocks: false, has_majors: false });
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to create department");
    }
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(API_ROUTES.academic.updateDepartment(editDeptId), editDeptForm);
      setDepartments(departments.map(d => d.id === editDeptId ? res.data : d));
      setEditDeptId(null);
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to update department");
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Delete this department? This cannot be undone and may affect users.")) return;
    try {
      await axios.delete(API_ROUTES.academic.deleteDepartment(id));
      setDepartments(departments.filter(d => d.id !== id));
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Cannot delete - users may be linked");
    }
  };

  // Blocks
  const handleCreateBlock = async (e) => {
    e.preventDefault();
    if (!selectedDeptForBlocks) return setAcademicError("Please select a department first");
    try {
      const res = await axios.post(API_ROUTES.academic.createBlockByDepartment(selectedDeptForBlocks), newBlock);
      setBlocks([...blocks, res.data]);
      setNewBlock({ name: "" });
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to create block");
    }
  };

  const handleUpdateBlock = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(API_ROUTES.academic.updateBlockByDepartment(editBlockId), editBlockForm);
      setBlocks(blocks.map(b => b.id === editBlockId ? res.data : b));
      setEditBlockId(null);
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to update block");
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm("Delete this block? This cannot be undone and may affect users.")) return;
    try {
      await axios.delete(API_ROUTES.academic.deleteBlockByDepartment(id));
      setBlocks(blocks.filter(b => b.id !== id));
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Cannot delete - users may be linked");
    }
  };

  // Majors
  const handleCreateMajor = async (e) => {
    e.preventDefault();
    if (!selectedDeptForMajors) return setAcademicError("Please select a department first");
    try {
      const res = await axios.post(API_ROUTES.academic.createMajorByDepartment(selectedDeptForMajors), newMajor);
      setMajors([...majors, res.data]);
      setNewMajor({ name: "" });
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to create major");
    }
  };

  const handleUpdateMajor = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(API_ROUTES.academic.updateMajorByDepartment(editMajorId), editMajorForm);
      setMajors(majors.map(m => m.id === editMajorId ? res.data : m));
      setEditMajorId(null);
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to update major");
    }
  };

  const handleDeleteMajor = async (id) => {
    if (!window.confirm("Delete this major? This cannot be undone and may affect users.")) return;
    try {
      await axios.delete(API_ROUTES.academic.deleteMajorByDepartment(id));
      setMajors(majors.filter(m => m.id !== id));
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Cannot delete - users may be linked");
    }
  };

  // Strands
  const handleCreateStrand = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_ROUTES.academic.createStrand, newStrand);
      setStrands([...strands, res.data]); // Real-time update
      setNewStrand({ name: "" });
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to create strand");
    }
  };

  const handleUpdateStrand = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(API_ROUTES.academic.updateStrand(editStrandId), editStrandForm);
      setStrands(strands.map(s => s.id === editStrandId ? res.data : s));
      setEditStrandId(null);
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Failed to update strand");
    }
  };

  const handleDeleteStrand = async (id) => {
    if (!window.confirm("Delete this strand? This cannot be undone and may affect users.")) return;
    try {
      await axios.delete(API_ROUTES.academic.deleteStrand(id));
      setStrands(strands.filter(s => s.id !== id));
    } catch (err) {
      setAcademicError(err.response?.data?.message || "Cannot delete - users may be linked");
    }
  };

  // ── Load Dependent Academic Data ──
  useEffect(() => {
    if (activeAcademicTab === "blocks" && selectedDeptForBlocks) {
      fetchBlocks(selectedDeptForBlocks);
    }
    if (activeAcademicTab === "majors" && selectedDeptForMajors) {
      fetchMajors(selectedDeptForMajors);
    }
  }, [activeAcademicTab, selectedDeptForBlocks, selectedDeptForMajors]);

  // ── Existing Handlers (Users & Projects) ──
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

      const payload = {
        username: addUserForm.username,
        full_name: addUserForm.full_name,
        email: addUserForm.email,
        password: addUserForm.password,
        role: addUserForm.role
      };

      if (addUserForm.role === "research_adviser") {
        payload.type = addUserForm.type;
        if (addUserForm.type === "college") payload.department_id = addUserForm.department_id;
        if (addUserForm.type === "senior_high") payload.strand_id = addUserForm.strand_id;
      }

      await axios.post(API_ROUTES.admin.addUser, payload);
      setAddUserMessage("User added successfully with temporary password");
      setAddUserForm({
        username: "", full_name: "", email: "", role: "admin", type: "",
        department_id: "", strand_id: "", password: "", confirm_password: ""
      });
      fetchUsers();
    } catch (err) {
      setAddUserError(err.response?.data?.message || "Failed to add user.");
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setProjectsError("");
    try {
      const res = await axios.get(API_ROUTES.admin.getAllProjects);
      setProjects(Array.isArray(res.data) ? res.data : res.data.projects || []);
    } catch (err) {
      setProjectsError("Failed to load projects.");
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    try {
      await axios.delete(API_ROUTES.admin.deleteProject(id));
      setProjects(prev => prev.filter(p => p.id !== id));
      axios.get(API_ROUTES.admin.getProjectCount)
        .then(res => setCounts(prev => ({ ...prev, ...res.data })))
        .catch(err => console.error("Failed to fetch project counts:", err));
    } catch (err) {
      alert(`Failed to delete project: ${err.response?.data?.error || "Unknown error"}`);
    }
  };

  const fetchUsers = () => {
    axios.get(API_ROUTES.admin.getAllUsers)
      .then(res => setUsers(res.data.users || []))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    if (user && user.force_password_change) {
      navigate("/force-change-password");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeSection === "dashboard" || activeSection === undefined) {
      axios.get(API_ROUTES.admin.getAllProjects)
        .then(res => setProjects(res.data.projects || []))
        .catch(() => setProjects([]));

      fetchProjects();

      axios.get(API_ROUTES.admin.getUserCount)
        .then(res => setCounts(prev => ({ ...prev, totalUsers: res.data.totalUsers || 0 })))
        .catch(err => console.error("Failed to fetch user count:", err));

      axios.get(API_ROUTES.admin.getProjectCount)
        .then(res => setCounts(prev => ({ ...prev, ...res.data })))
        .catch(err => console.error("Failed to fetch project counts:", err));

      fetchUsers();
    }
  }, [activeSection, fetchProjects]);

  useEffect(() => {
    if (activeSection === "users") {
      fetchUsers();
      setCurrentPage(1);
    }
    if (activeSection === "projects") {
      fetchProjects();
      setProjectPage(1);
    }
  }, [activeSection, fetchProjects]);

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

      await axios.put(API_ROUTES.admin.updateUser(editUserId), updatePayload);
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
      await axios.delete(API_ROUTES.admin.deleteUser(id));
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

  const handleSearchChange = (e) => {
    setUserSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleProjectSearchChange = (e) => {
    setProjectSearch(e.target.value);
    setProjectPage(1);
  };

  const filteredUsers = users.filter(user => {
    const searchTerm = userSearch.toLowerCase();
    const nameMatch = user.full_name?.toLowerCase().includes(searchTerm);
    const emailMatch = user.email?.toLowerCase().includes(searchTerm);
    const roleMatch = user.role?.toLowerCase().includes(searchTerm);
    const joinedDate = new Date(user.created_at).toLocaleDateString().toLowerCase();
    return nameMatch || emailMatch || roleMatch || joinedDate.includes(searchTerm);
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const filteredUsersOnPage = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const filteredProjects = useMemo(() => {
    const term = (projectSearch || "").toLowerCase();
    if (!term) return projects;
    return projects.filter(p => {
      return (
        p.title?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.authors?.toLowerCase().includes(term) ||
        p.abstract?.toLowerCase().includes(term)
      );
    });
  }, [projects, projectSearch]);

  const totalProjectPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE));
  const projectStart = (projectPage - 1) * PROJECTS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(projectStart, projectStart + PROJECTS_PER_PAGE);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const paginateProjects = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalProjectPages) {
      setProjectPage(pageNumber);
    }
  };

  const section = activeSection || "dashboard";

  return (
    <>
      {/* Dashboard Section */}
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

          <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', fontSize: '1.5rem', color: '#3a3e92' }}>
            Project Status Summary
          </h2>
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

      {/* Users Section - NOW DYNAMIC */}
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
                <option value="research_coordinator">Research Coordinator</option>
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
                    <select
                      name="department_id"
                      value={addUserForm.department_id}
                      onChange={handleAddUserChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.length === 0 ? (
                        <option disabled>No departments available</option>
                      ) : (
                        departments.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}

                  {addUserForm.type === "senior_high" && (
                    <select
                      name="strand_id"
                      value={addUserForm.strand_id}
                      onChange={handleAddUserChange}
                      required
                    >
                      <option value="">Select Strand</option>
                      {strands.length === 0 ? (
                        <option disabled>No strands available</option>
                      ) : (
                        strands.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </>
              )}

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
                    src={showAddUserPassword ? openEyeIcon : closeEyeIcon}
                    alt={showAddUserPassword ? "Hide" : "Show"}
                  />
                </span>
              </div>

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
                    src={showAddUserConfirm ? openEyeIcon : closeEyeIcon}
                    alt={showAddUserConfirm ? "Hide" : "Show"}
                  />
                </span>
              </div>

              <button type="submit" className="admin-btn">Add User</button>
              {addUserMessage && <div className="admin-message" style={{ color: "green" }}>{addUserMessage}</div>}
              {addUserError && <div className="admin-message" style={{ color: "red" }}>{addUserError}</div>}
            </form>
          </section>

          {message && <div className="admin-message">{message}</div>}

          {editUserId && (
            <div className="admin-edit-modal">
              <form onSubmit={handleUserSubmit} className="admin-edit-form">
                <h4>Edit User</h4>
                <input
                  name="full_name"
                  value={editForm.full_name}
                  onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Full Name"
                  required
                />
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Email"
                  required
                />
                <select
                  name="role"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="res">Research Coordinator</option>
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

      {/* Projects Section */}
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

      {/* Academic Settings Section */}
      {section === "academic" && (
        <section className="admin-section">
          <h3 style={{ marginTop: '3rem', marginBottom: '2rem', fontSize: '1.8rem' }}>
            Academic Settings
          </h3>

          {academicLoading && <div className="admin-message">Loading academic data...</div>}
          {academicError && <div className="admin-message" style={{ color: "red" }}>{academicError}</div>}

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '0.5rem'
          }}>
            {['departments', 'blocks', 'majors', 'strands'].map(tab => (
              <button
                key={tab}
                className={`admin-btn ${activeAcademicTab === tab ? "active" : ""}`}
                onClick={() => setActiveAcademicTab(tab)}
                style={{
                  background: activeAcademicTab === tab ? '#3a3e92' : '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Departments Tab */}
          {activeAcademicTab === "departments" && (
          <>
            <div className="add-academic-bar">
              <form onSubmit={handleCreateDepartment} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <input
                  placeholder="Department Name (e.g. BSIT)"
                  value={newDept.name}
                  onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                  required
                  style={{ flex: 1, minWidth: '200px', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={newDept.has_blocks}
                    onChange={e => setNewDept({ ...newDept, has_blocks: e.target.checked })}
                  />
                  Has Blocks
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={newDept.has_majors}
                    onChange={e => setNewDept({ ...newDept, has_majors: e.target.checked })}
                  />
                  Has Majors
                </label>
                <button type="submit" className="admin-btn">Add Department</button>
              </form>
            </div>

            <div className="admin-list-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Has Blocks</th>
                    <th>Has Majors</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: "center" }}>No departments found</td></tr>
                  ) : (
                    departments.map(d => (
                      <tr key={d.id}>
                        <td>{d.name}</td>
                        <td>{d.has_blocks ? "Yes" : "No"}</td>
                        <td>{d.has_majors ? "Yes" : "No"}</td>
                        <td>
                          <button
                            className="admin-btn edit-btn"
                            onClick={() => {
                              setEditDeptId(d.id);
                              setEditDeptForm({ name: d.name, has_blocks: d.has_blocks, has_majors: d.has_majors });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-btn delete-btn"
                            onClick={() => handleDeleteDepartment(d.id)}
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

            {editDeptId && (
              <div className="admin-edit-modal">
                <form onSubmit={handleUpdateDepartment} className="admin-edit-form">
                  <h4>Edit Department</h4>
                  <input
                    value={editDeptForm.name}
                    onChange={e => setEditDeptForm({ ...editDeptForm, name: e.target.value })}
                    required
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={editDeptForm.has_blocks}
                      onChange={e => setEditDeptForm({ ...editDeptForm, has_blocks: e.target.checked })}
                    />
                    Has Blocks
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={editDeptForm.has_majors}
                      onChange={e => setEditDeptForm({ ...editDeptForm, has_majors: e.target.checked })}
                    />
                    Has Majors
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="admin-btn edit-btn">Save</button>
                    <button
                      type="button"
                      className="admin-btn cancel-btn"
                      onClick={() => setEditDeptId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

          {/* Blocks Tab */}
          {activeAcademicTab === "blocks" && (
            <>
              <select
                value={selectedDeptForBlocks}
                onChange={e => {
                  setSelectedDeptForBlocks(e.target.value);
                  setEditBlockId(null);
                }}
                className="admin-form-input"
                style={{ width: '100%', maxWidth: '400px', marginBottom: '1.5rem' }}
              >
                <option value="">Select Department to manage blocks</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {selectedDeptForBlocks && (
                <>
                  <form onSubmit={handleCreateBlock} className="admin-form" style={{ marginBottom: '2rem' }}>
                    <input
                      placeholder="New Block Name (e.g. A, B)"
                      value={newBlock.name}
                      onChange={e => setNewBlock({ name: e.target.value })}
                      required
                    />
                    <button type="submit" className="admin-btn">Add Block</button>
                  </form>

                  <div className="admin-list-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Block Name</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blocks.length === 0 ? (
                          <tr><td colSpan="2" style={{ textAlign: "center" }}>No blocks found</td></tr>
                        ) : (
                          blocks.map(b => (
                            <tr key={b.id}>
                              <td>{b.name}</td>
                              <td>
                                <button
                                  className="admin-btn edit-btn"
                                  onClick={() => {
                                    setEditBlockId(b.id);
                                    setEditBlockForm({ name: b.name });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="admin-btn delete-btn"
                                  onClick={() => handleDeleteBlock(b.id)}
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

                  {editBlockId && (
                    <div className="admin-edit-modal">
                      <form onSubmit={handleUpdateBlock} className="admin-edit-form">
                        <h4>Edit Block</h4>
                        <input
                          value={editBlockForm.name}
                          onChange={e => setEditBlockForm({ ...editBlockForm, name: e.target.value })}
                          required
                        />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="submit" className="admin-btn edit-btn">Save</button>
                          <button type="button" className="admin-btn cancel-btn" onClick={() => setEditBlockId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Majors Tab */}
          {activeAcademicTab === "majors" && (
            <>
              <select
                value={selectedDeptForMajors}
                onChange={e => {
                  setSelectedDeptForMajors(e.target.value);
                  setEditMajorId(null);
                }}
                className="admin-form-input"
                style={{ width: '100%', maxWidth: '400px', marginBottom: '1.5rem' }}
              >
                <option value="">Select Department to manage majors</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {selectedDeptForMajors && (
                <>
                  <form onSubmit={handleCreateMajor} className="admin-form" style={{ marginBottom: '2rem' }}>
                    <input
                      placeholder="New Major Name (e.g. English)"
                      value={newMajor.name}
                      onChange={e => setNewMajor({ name: e.target.value })}
                      required
                    />
                    <button type="submit" className="admin-btn">Add Major</button>
                  </form>

                  <div className="admin-list-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Major Name</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {majors.length === 0 ? (
                          <tr><td colSpan="2" style={{ textAlign: "center" }}>No majors found</td></tr>
                        ) : (
                          majors.map(m => (
                            <tr key={m.id}>
                              <td>{m.name}</td>
                              <td>
                                <button
                                  className="admin-btn edit-btn"
                                  onClick={() => {
                                    setEditMajorId(m.id);
                                    setEditMajorForm({ name: m.name });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="admin-btn delete-btn"
                                  onClick={() => handleDeleteMajor(m.id)}
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

                  {editMajorId && (
                    <div className="admin-edit-modal">
                      <form onSubmit={handleUpdateMajor} className="admin-edit-form">
                        <h4>Edit Major</h4>
                        <input
                          value={editMajorForm.name}
                          onChange={e => setEditMajorForm({ ...editMajorForm, name: e.target.value })}
                          required
                        />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="submit" className="admin-btn edit-btn">Save</button>
                          <button type="button" className="admin-btn cancel-btn" onClick={() => setEditMajorId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Strands Tab */}
          {activeAcademicTab === "strands" && (
            <>
              <form onSubmit={handleCreateStrand} className="admin-form" style={{ marginBottom: '2rem' }}>
                <input
                  placeholder="New Strand Name (e.g. STEM)"
                  value={newStrand.name}
                  onChange={e => setNewStrand({ name: e.target.value })}
                  required
                />
                <button type="submit" className="admin-btn">Add Strand</button>
              </form>

              <div className="admin-list-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Strand Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strands.length === 0 ? (
                      <tr><td colSpan="2" style={{ textAlign: "center" }}>No strands found</td></tr>
                    ) : (
                      strands.map(s => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>
                            <button
                              className="admin-btn edit-btn"
                              onClick={() => {
                                setEditStrandId(s.id);
                                setEditStrandForm({ name: s.name });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="admin-btn delete-btn"
                              onClick={() => handleDeleteStrand(s.id)}
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

              {editStrandId && (
                <div className="admin-edit-modal">
                  <form onSubmit={handleUpdateStrand} className="admin-edit-form">
                    <h4>Edit Strand</h4>
                    <input
                      value={editStrandForm.name}
                      onChange={e => setEditStrandForm({ ...editStrandForm, name: e.target.value })}
                      required
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="submit" className="admin-btn edit-btn">Save</button>
                      <button type="button" className="admin-btn cancel-btn" onClick={() => setEditStrandId(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
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