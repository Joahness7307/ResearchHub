import React, { useContext, useState, useEffect, useMemo, memo } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./MyAccount.css";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import categoryColors from "../../constants/categoryColors";
import dropdownArrow from "../../assets/dropdownArrow.png";
import UserAvatar from "../../components/UserAvatar";

// THIS IS THE KEY FIX: Memoized component so inputs don't lose focus
const AccountInfoColumn = memo(function AccountInfoColumn({
  user,
  editing,
  editForm,
  previewUrl,
  editError,
  saving,
  avatarUserProps,
  onFileChange,
  onInputChange,
  onSave,
  onCancel,
  onEditStart,
}) {
  return (
    <div className="account-info-col">
      <div className="account-header">
        <div className="account-avatar account-avatar-with-pic">
          <UserAvatar user={user} size={100} fontSize={40} />
        </div>
        <div className="account-info">
          <h2>{user?.full_name}</h2>
          <span className="account-role">
            {(user?.role || "").replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
          <button className="edit-profile-btn" onClick={onEditStart}>
            Edit Profile
          </button>
        ) : (
          <div className="edit-profile-form">
            {editError && <div className="edit-error-message">{editError}</div>}

            <div className="profile-pic-uploader">
              <div className="profile-pic-preview">
                <UserAvatar user={avatarUserProps} size={100} fontSize={40} />
              </div>
              <input type="file" accept="image/*" onChange={onFileChange} />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                name="full_name"
                value={editForm.full_name}
                onChange={onInputChange}
                className="form-input"
                placeholder="Full Name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={editForm.username}
                onChange={onInputChange}
                className="form-input"
                placeholder="Username"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={editForm.email}
                onChange={onInputChange}
                className="form-input"
                type="email"
                placeholder="Email"
              />
            </div>

            <div className="edit-profile-actions">
              <button className="save-profile-btn" onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="cancel-profile-btn" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

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
    const fetchBookmarks = async () => {
      try {
        const res = await axios.get("/bookmarks/my");
        let projects = res.data;
        if (Array.isArray(projects) && projects.length && projects[0].project) {
          projects = projects.map((bm) => bm.project).filter(Boolean);
        }
        setBookmarkedProjects(projects || []);
      } catch {
        setBookmarkedProjects([]);
      }
    };
    fetchBookmarks();
    window.addEventListener("bookmarks-updated", fetchBookmarks);
    return () => window.removeEventListener("bookmarks-updated", fetchBookmarks);
  }, [user]);

  // Fetch student projects
  useEffect(() => {
    if (!user || user.role !== "student") {
      setProjects([]);
      return;
    }
    const eligible =
      user.year_level === "3rd" ||
      user.year_level === "4th" ||
      user.grade_level === "12";
    if (eligible) {
      axios.get("/users/my-projects")
        .then((res) => setProjects(res.data.projects || []))
        .catch(() => setProjects([]));
    } else {
      setProjects([]);
    }
  }, [user]);

  const isEligibleStudent = user?.role === "student" &&
    (user?.year_level === "3rd" || user?.year_level === "4th" || user?.grade_level === "12");

  const isPrivilegedRole = () =>
    ["admin", "head_admin", "research_adviser", "guest"].includes(user?.role);

  // Stable avatar object
  const avatarUserProps = useMemo(
    () => ({
      full_name: editForm.full_name || user?.full_name || "",
      profile_pic_url: previewUrl || user?.profile_pic_url || null,
    }),
    [editForm.full_name, previewUrl, user?.full_name, user?.profile_pic_url]
  );

  // Grouped projects
  const grouped = useMemo(() => {
    const g = { pending: [], endorsed: [], need_revision: [], approved: [] };
    projects.forEach((p) => {
      let status = p.status;
      if (status === "admin_revision") status = "need_revision";
      if (g[status]) g[status].push(p);
    });
    return g;
  }, [projects]);

  // Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowed.includes(file.type)) return setEditError("Only JPG, PNG, GIF, WEBP allowed.");
    if (file.size > MAX_SIZE) return setEditError("Image must be under 5MB.");

    setEditError("");
    setEditForm((prev) => ({ ...prev, profileFile: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditStart = () => setEditing(true);

  const handleCancel = () => {
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

  const handleSave = async () => {
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
      setEditError(err.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const renderGroup = (title, key, dataOverride = null) => {
    const data = dataOverride ?? grouped[key];
    return (
      <div className="status-group-wrapper">
        <div className="status-group-header" onClick={() => setOpenGroups((p) => ({ ...p, [key]: !p[key] }))}>
          <img
            src={dropdownArrow}
            alt="toggle"
            style={{ transform: openGroups[key] ? "rotate(90deg)" : "0deg", transition: "0.2s" }}
          />
          <h4 className="group-title">{title}</h4>
          <span className="group-count">({data.length})</span>
        </div>
        {openGroups[key] && (
          data.length === 0 ? (
            <div className="no-papers">
              {title.includes("Watch") ? "No bookmarked projects." : "No projects."}
            </div>
          ) : (
            <ul className="my-papers-list">
              {data.map((p) => (
                <li
                  key={p.id}
                  className="my-paper-item"
                  onClick={() => {
                    const role = user?.role;
                    let path = `/projects/${p.id}`;
                    if (role === "research_adviser") path = `/adviser/projects/${p.id}`;
                    else if (role === "head_admin") path = `/head-admin/projects/${p.id}`;
                    else if (role === "admin") path = `/admin/projects/${p.id}`;
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
                    <a href={p.documentPath || p.document_path} target="_blank" rel="noopener noreferrer" className="view-pdf-btn" onClick={(e) => e.stopPropagation()}>
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

  // === RENDER ===
  if (isEligibleStudent) {
    return (
      <div className="two-column-layout">
        <AccountInfoColumn
          user={user}
          editing={editing}
          editForm={editForm}
          previewUrl={previewUrl}
          editError={editError}
          saving={saving}
          avatarUserProps={avatarUserProps}
          onFileChange={handleFileChange}
          onInputChange={handleInputChange}
          onSave={handleSave}
          onCancel={handleCancel}
          onEditStart={handleEditStart}
        />
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

  if (isPrivilegedRole()) {
    return (
      <div className="two-column-layout">
        <AccountInfoColumn
          user={user}
          editing={editing}
          editForm={editForm}
          previewUrl={previewUrl}
          editError={editError}
          saving={saving}
          avatarUserProps={avatarUserProps}
          onFileChange={handleFileChange}
          onInputChange={handleInputChange}
          onSave={handleSave}
          onCancel={handleCancel}
          onEditStart={handleEditStart}
        />
        <div className="account-papers-col">
          <div className="account-papers-section">
            <h3>My Watch List</h3>
            {renderGroup("Bookmarked", "bookmarked", bookmarkedProjects)}
          </div>
        </div>
      </div>
    );
  }

  // Default single-column layout
  return (
    <div className="my-account">
      <div className="account-header">
        <div className="account-avatar account-avatar-with-pic">
          <UserAvatar user={user} size={100} fontSize={40} />
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

      <AccountInfoColumn
        user={user}
        editing={editing}
        editForm={editForm}
        previewUrl={previewUrl}
        editError={editError}
        saving={saving}
        avatarUserProps={avatarUserProps}
        onFileChange={handleFileChange}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onCancel={handleCancel}
        onEditStart={handleEditStart}
      />

      <div className="account-papers-section">
        <h3>My Watch List</h3>
        {renderGroup("My Watch List", "bookmarked", bookmarkedProjects)}
      </div>
    </div>
  );
};

export default MyAccount;