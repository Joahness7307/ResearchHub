import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./MyAccount.css";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import categoryColors from "../../constants/categoryColors";
import dropdownArrow from "../../assets/dropdownArrow.png";
import UserAvatar from "../../components/UserAvatar";

const MyAccount = () => {
  const { user, login } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    email: "",
    profileFile: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    pending: true,
    endorsed: false,
    need_revision: false,
    approved: false,
    bookmarked: false,
  });
  const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
  const navigate = useNavigate();

  // Sync form
  useEffect(() => {
    if (user) {
      setEditForm({
        full_name: user.full_name || "",
        username: user.username || "",
        email: user.email || "",
        profileFile: null,
      });
      setPreviewUrl(user.profile_pic_url || null);
    }
  }, [user]);

  // Fetch bookmarks
  useEffect(() => {
    if (!user) return;
    const fetchBookmarks = () => {
      axios.get("/bookmarks/my")
        .then(res => {
          let projects = res.data;
          if (Array.isArray(projects) && projects.length && projects[0].project) {
            projects = projects.map(bm => bm.project).filter(Boolean);
          }
          setBookmarkedProjects(projects || []);
        })
        .catch(() => setBookmarkedProjects([]));
    };
    fetchBookmarks();
    window.addEventListener("bookmarks-updated", fetchBookmarks);
    return () => window.removeEventListener("bookmarks-updated", fetchBookmarks);
  }, [user]);

  // Check if student is eligible (for projects)
  const isEligibleStudent = () => {
    return user?.role === "student" && 
           (user.year_level === "3rd" || user.year_level === "4th" || user.grade_level === "12");
  };

  // Check if user is admin/head_admin/adviser/guest → gets two-column with only bookmarks
  const isPrivilegedRole = () => {
    return ["admin", "head_admin", "research_adviser", "guest"].includes(user?.role);
  };

  // Fetch student projects
  useEffect(() => {
    if (user && user.role === "student" && isEligibleStudent()) {
      axios.get("/users/my-projects")
        .then(res => setProjects(res.data.projects || []))
        .catch(() => setProjects([]));
    }
  }, [user]);

  // Group student projects
  const grouped = { pending: [], endorsed: [], need_revision: [], approved: [] };
  projects.forEach(p => {
    let status = p.status;
    if (status === "admin_revision") status = "need_revision";
    if (grouped[status]) grouped[status].push(p);
  });

  // Handlers (unchanged)
  const handleProfileFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const MAX = 5 * 1024 * 1024;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(f.type)) return setEditError("Only JPG, PNG, GIF, or WEBP allowed.");
    if (f.size > MAX) return setEditError("Image must be under 5MB.");
    setEditError("");
    setEditForm(prev => ({ ...prev, profileFile: f }));
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleEditField = (e) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCancelEdit = () => {
    setEditing(false);
    setEditError("");
    setPreviewUrl(user?.profile_pic_url || null);
    setEditForm({
      full_name: user?.full_name || "",
      username: user?.username || "",
      email: user?.email || "",
      profileFile: null,
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setEditError("");
    try {
      const fd = new FormData();
      fd.append("full_name", editForm.full_name);
      fd.append("username", editForm.username);
      fd.append("email", editForm.email);
      if (editForm.profileFile) fd.append("profile_pic", editForm.profileFile);
      const res = await axios.put("/users/profile/update", fd);
      login(res.data.user, localStorage.getItem("token"));
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Shared render group
  const renderGroup = (title, key, dataOverride = null) => {
    const data = dataOverride ?? grouped[key];
    return (
      <div className="status-group-wrapper">
        <div className="status-group-header" onClick={() => setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))}>
          <img src={dropdownArrow} alt="toggle" style={{ transform: openGroups[key] ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
          <h4 className="group-title">{title}</h4>
          <span className="group-count">({data.length})</span>
        </div>
        {openGroups[key] && (
          data.length === 0 ? (
            <div className="no-papers">{title.includes("Watch List") ? "No bookmarked projects." : "No projects."}</div>
          ) : (
            <ul className="my-papers-list">
              {data.map(p => (
                <li
                  key={p.id}
                  className="my-paper-item"
                  onClick={() => {
                    let path;
                    if (user?.role === "research_adviser") {
                      path = `/adviser/projects/${p.id}`;
                    } else if (user?.role === "head_admin") {
                      path = `/head-admin/projects/${p.id}`;
                    } else if (user?.role === "admin") {
                      path = `/admin/projects/${p.id}`;
                    } else {
                      path = `/projects/${p.id}`;
                    }
                    navigate(path);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="paper-title">{p.title}</div>
                  <div className="paper-category" style={{ background: categoryColors[p.category] || "#2563eb", color: "#fff" }}>
                    {p.category}
                  </div>
                  <div className="paper-authors-row"><b>Authors:</b> {p.authors}</div>
                  <div className="paper-abstract">
                    <b>Abstract:</b> {(p.abstract || "").slice(0, 120)}...
                  </div>
                  <div className="paper-actions">
                    <a href={p.documentPath || p.document_path} target="_blank" rel="noopener noreferrer" className="view-pdf-btn" onClick={e => e.stopPropagation()}>
                      View PDF
                    </a>
                    <span className="paper-date">
                      {new Date(p.created_at || p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    );
  };

  // Shared Account Info Column
  const AccountInfoColumn = () => (
    <div className="account-info-col">
      <div className="account-header">
        <div className="account-avatar account-avatar-with-pic">
          <div className="account-avatar">
            <UserAvatar user={user} size={100} fontSize={40} />
          </div>
        </div>
        <div className="account-info">
          <h2>{user?.full_name}</h2>
          <span className="account-role">
            {(user?.role || "").replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      <div className="account-details">
        <div className="account-detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{user?.email}</span>
        </div>
        {user?.department && (
          <div className="account-detail-row">
            <span className="detail-label">Department:</span>
            <span className="detail-value">{user.department}</span>
          </div>
        )}
        {user?.strand && (
          <div className="account-detail-row">
            <span className="detail-label">Strand:</span>
            <span className="detail-value">{user.strand}</span>
          </div>
        )}
      </div>

      <div className="edit-profile-container">
        {!editing ? (
          <button className="edit-profile-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="edit-profile-form">
            {editError && <div className="edit-error-message">{editError}</div>}
            <div className="profile-pic-uploader">
              <div className="profile-pic-preview">
                <UserAvatar 
                  user={{
                    full_name: editForm.full_name || user?.full_name,
                    profile_pic_url: previewUrl || user?.profile_pic_url
                  }} 
                  size={100} 
                  fontSize={40} 
                />
              </div>
              <input type="file" accept="image/*" onChange={handleProfileFileChange} />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input name="full_name" value={editForm.full_name} onChange={handleEditField} className="form-input" />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input name="username" value={editForm.username} onChange={handleEditField} className="form-input" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={editForm.email} onChange={handleEditField} className="form-input" />
            </div>
            <div className="edit-profile-actions">
              <button className="save-profile-btn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="cancel-profile-btn" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 1. Eligible Students → Two-column (unchanged)
  if (user?.role === "student" && isEligibleStudent()) {
    return (
      <div className="two-column-layout">
        <AccountInfoColumn />
        <div className="account-papers-col">
          <div className="account-papers-section">
            <h3>My Projects & Bookmarks</h3>
            {renderGroup("Pending", "pending")}
            {renderGroup("Endorsed", "endorsed")}
            {renderGroup("Need Revision", "need_revision")}
            {renderGroup("Approved", "approved")}
            {renderGroup("My Watch List", "bookmarked", bookmarkedProjects)}
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin / Head Admin / Adviser / Guest → Two-column with only Watch List
  if (isPrivilegedRole()) {
    return (
      <div className="two-column-layout">
        <AccountInfoColumn />
        <div className="account-papers-col">
          <div className="account-papers-section">
            <h3>My Watch List</h3>
            {renderGroup("Bookmarked", "bookmarked", bookmarkedProjects)}
          </div>
        </div>
      </div>
    );
  }

  // 3. Everyone else (ineligible students, etc.) → original single column
  return (
    <div className="my-account">
      {/* Your original single-column layout — unchanged */}
      <div className="account-header">
        <div className="account-avatar account-avatar-with-pic">
          <div className="account-avatar">
            <UserAvatar user={user} size={100} fontSize={40} />
          </div>
        </div>
        <div className="account-info">
          <h2>{user?.full_name}</h2>
          <span className="account-role">{(user?.role || "").replace("_", " ")}</span>
        </div>
      </div>
      <div className="account-details">
        <div className="account-detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{user?.email}</span>
        </div>
        {user?.department && (
          <div className="account-detail-row">
            <span className="detail-label">Department:</span>
            <span className="detail-value">{user.department}</span>
          </div>
        )}
        {user?.strand && (
          <div className="account-detail-row">
            <span className="detail-label">Strand:</span>
            <span className="detail-value">{user.strand}</span>
          </div>
        )}
      </div>
      <div className="edit-profile-container">
        {!editing ? (
          <button className="edit-profile-btn" onClick={() => setEditing(true)}>Edit Profile</button>
        ) : (
          <div className="edit-profile-form">
            {editError && <div className="edit-error-message">{editError}</div>}
            <div className="profile-pic-uploader">
              <div className="profile-pic-preview">
                <UserAvatar 
                  user={{
                    full_name: editForm.full_name || user?.full_name,
                    profile_pic_url: previewUrl || user?.profile_pic_url
                  }} 
                  size={100} 
                  fontSize={40} 
                />
              </div>
              <input type="file" accept="image/*" onChange={handleProfileFileChange} />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input name="full_name" value={editForm.full_name} onChange={handleEditField} className="form-input" />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input name="username" value={editForm.username} onChange={handleEditField} className="form-input" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={editForm.email} onChange={handleEditField} className="form-input" />
            </div>
            <div className="edit-profile-actions">
              <button className="save-profile-btn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="cancel-profile-btn" onClick={handleCancelEdit}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <div className="account-papers-section">
        <h3>My Watch List</h3>
        {renderGroup("My Watch List", "bookmarked", bookmarkedProjects)}
      </div>
    </div>
  );
};

export default MyAccount;