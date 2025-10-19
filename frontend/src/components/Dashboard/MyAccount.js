import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./MyAccount.css";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import categoryColors from "../../constants/categoryColors";
import dropdownArrow from "../../assets/dropdownArrow.png";

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
  });
  const navigate = useNavigate();

  // sync edit form with current user when opening editor or when user changes
  useEffect(() => {
    if (user) {
      setEditForm((prev) => ({
        ...prev,
        full_name: user.full_name || "",
        username: user.username || "",
        email: user.email || "",
      }));
      setPreviewUrl(user.profile_pic_url || null);
    }
  }, [user]);

  // Helper: check if student is eligible to upload/see two-column layout
  function isEligible(user) {
    if (user.role !== "student") return false;
    if (user.year_level === "3rd" || user.year_level === "4th") return true;
    if (user.grade_level === "12") return true;
    return false;
  }

  // handle profile file change (preview)
  const handleProfileFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setEditForm((prev) => ({ ...prev, profileFile: f }));
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleEditField = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditError("");
    // reset preview to user's existing pic
    setPreviewUrl(user?.profile_pic_url || null);
    setEditForm((prev) => ({
      ...prev,
      full_name: user?.full_name || "",
      username: user?.username || "",
      email: user?.email || "",
      profileFile: null,
    }));
  };

  const handleSaveProfile = async () => {
    setEditError("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("full_name", editForm.full_name);
      fd.append("username", editForm.username);
      fd.append("email", editForm.email);
      if (editForm.profileFile) fd.append("profile_pic", editForm.profileFile);

      const res = await axios.put("/users/profile/update", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // update AuthContext stored user
      const updatedUser = res.data.user;
      login(updatedUser, localStorage.getItem("token"));
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Only fetch projects for students
  useEffect(() => {
    if (user && user.role === "student" && isEligible(user)) {
      axios
        .get("/users/my-projects")
        .then((res) => setProjects(res.data.projects || []))
        .catch(() => setProjects([]));
    }
  }, [user]);

  // Only show projects with status "need_revision" (not "admin_revision")
  const grouped = {
    pending: [],
    endorsed: [],
    need_revision: [],
    approved: [],
  };
  projects.forEach((project) => {
    if (grouped[project.status]) grouped[project.status].push(project);
  });
  // Do NOT show admin_revision to students

  // Helper to render each group (for students only)
  const renderGroup = (title, statusKey) => (
    <div className="status-group-wrapper">
      <div
        className="status-group-header"
        onClick={() =>
          setOpenGroups((prev) => ({ ...prev, [statusKey]: !prev[statusKey] }))
        }
      >
        <img
          src={dropdownArrow}
          alt="toggle"
          style={{
            transform: openGroups[statusKey] ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
        <h4 className="group-title">{title}</h4>
        <span className="group-count">({grouped[statusKey].length})</span>
      </div>
      {openGroups[statusKey] &&
        (grouped[statusKey].length === 0 ? (
          <div className="no-papers">No projects.</div>
        ) : (
          <ul className="my-papers-list">
            {grouped[statusKey].map((project) => {
              const fullDocumentPath = project.documentPath;
              return (
                <li
                  key={project.id}
                  className="my-paper-item"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="paper-title">{project.title}</div>
                  <div className="paper-meta">
                    <span
                      className="paper-category"
                      style={{
                        background:
                          categoryColors[project.category] || "#2563eb",
                        color: "#fff",
                      }}
                    >
                      {project.category}
                    </span>
                  </div>
                  <div className="paper-authors-row">
                    <span className="paper-authors-label">
                      <b>Authors:</b>
                    </span>
                    <span className="paper-authors">{project.authors}</span>
                  </div>
                  <div className="paper-abstract">
                    <b>Abstract:</b>{" "}
                    {project.abstract.length > 120
                      ? project.abstract.slice(0, 120) + "..."
                      : project.abstract}
                  </div>
                  <div className="paper-actions">
                    <a
                      href={fullDocumentPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-pdf-btn"
                      onClick={(e) => e.stopPropagation()} // Prevent list item click from navigating
                    >
                      View PDF
                    </a>
                    <span className="paper-date">
                      Uploaded: {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ))}
    </div>
  );

  // Two-column layout for eligible students
  if (user && user.role === "student" && isEligible(user)) {
    return (
      <div className="two-column-layout">
        <div className="account-info-col">
          <div className="account-header">
            <div className="account-avatar account-avatar-with-pic">
              {user?.profile_pic_url ? (
                <img
                  src={user.profile_pic_url}
                  alt="avatar"
                  className="profile-pic"
                />
              ) : (
                user.full_name ? user.full_name[0].toUpperCase() : "?"
              )}
            </div>
            <div className="account-info">
              <h2>{user.full_name}</h2>
              <span className="account-role">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="account-details">
            <div className="account-detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            {user.department && (
              <div className="account-detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{user.department}</span>
              </div>
            )}
            {user.strand && (
              <div className="account-detail-row">
                <span className="detail-label">Strand:</span>
                <span className="detail-value">{user.strand}</span>
              </div>
            )}
          </div>
          {/* Edit Profile button/form */}
          <div className="edit-profile-container">
            {!editing ? (
              <button
                className="edit-profile-btn"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-profile-form">
                {editError && (
                  <div className="edit-error-message">{editError}</div>
                )}
                <div className="profile-pic-uploader">
                  <div className="profile-pic-preview">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="profile-pic"
                      />
                    ) : (
                      user.full_name ? user.full_name[0].toUpperCase() : "?"
                    )}
                  </div>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      name="profile_pic"
                      accept="image/*"
                      onChange={handleProfileFileChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    id="full_name"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleEditField}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditField}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditField}
                    className="form-input"
                  />
                </div>
                <div className="edit-profile-actions">
                  <button
                    className="save-profile-btn"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="cancel-profile-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="account-papers-col">
          <div className="account-papers-section">
            <h3>My Submitted Projects</h3>
            {grouped.pending.length > 0 || openGroups.pending ? renderGroup("Pending", "pending") : null}
            {grouped.endorsed.length > 0 || openGroups.endorsed ? renderGroup("Endorsed", "endorsed") : null}
            {grouped.need_revision.length > 0 || openGroups.need_revision ? renderGroup("Need Revision", "need_revision") : null}
            {grouped.approved.length > 0 || openGroups.approved ? renderGroup("Approved", "approved") : null}
            
            {/* Fallback if no projects exist, and all groups are closed (which shouldn't happen with default `pending: true`) */}
            {projects.length === 0 && (
                <div className="no-papers-found">You have not submitted any projects yet.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Single-column layout for ineligible students, admin, etc.
  return (
    <div className="my-account">
      <div className="account-header">
        <div className="account-avatar account-avatar-with-pic">
              {user?.profile_pic_url ? (
                <img
                  src={user.profile_pic_url}
                  alt="avatar"
                  className="profile-pic"
                />
              ) : (
                user.full_name ? user.full_name[0].toUpperCase() : "?"
              )}
            </div>
        <div className="account-info">
          <h2>{user.full_name}</h2>
          <span className="account-role">{user.role.replace("_", " ")}</span>
        </div>
      </div>
      <div className="account-details">
        <div className="account-detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{user.email}</span>
        </div>
        {user.department && (
          <div className="account-detail-row">
            <span className="detail-label">Department:</span>
            <span className="detail-value">{user.department}</span>
          </div>
        )}
        {user.strand && (
          <div className="account-detail-row">
            <span className="detail-label">Strand:</span>
            <span className="detail-value">{user.strand}</span>
          </div>
        )}
      </div>
      {/* Edit Profile button/form */}
          <div className="edit-profile-container">
            {!editing ? (
              <button
                className="edit-profile-btn"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-profile-form">
                {editError && (
                  <div className="edit-error-message">{editError}</div>
                )}
                <div className="profile-pic-uploader">
                  <div className="profile-pic-preview">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="profile-pic"
                      />
                    ) : (
                      user.full_name ? user.full_name[0].toUpperCase() : "?"
                    )}
                  </div>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      name="profile_pic"
                      accept="image/*"
                      onChange={handleProfileFileChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    id="full_name"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleEditField}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditField}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditField}
                    className="form-input"
                  />
                </div>
                <div className="edit-profile-actions">
                  <button
                    className="save-profile-btn"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="cancel-profile-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
    </div>
  );
};

export default MyAccount;