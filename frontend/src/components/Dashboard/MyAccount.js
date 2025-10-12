import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./MyAccount.css";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import categoryColors from "../../constants/categoryColors";
import dropdownArrow from "../../assets/dropdownArrow.png";

const MyAccount = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [openGroups, setOpenGroups] = useState({
    pending: true,
    endorsed: false,
    need_revision: false,
    approved: false,
  });
  const navigate = useNavigate();

  // Helper: check if student is eligible to upload/see two-column layout
  function isEligible(user) {
    if (user.role !== "student") return false;
    if (user.year_level === "3rd" || user.year_level === "4th") return true;
    if (user.grade_level === "12") return true;
    return false;
  }

  // Only fetch projects for students
  useEffect(() => {
    if (user && user.role === "student" && isEligible(user)) {
      axios.get("/users/my-projects")
        .then(res => setProjects(res.data.projects || []))
        .catch(() => setProjects([]));
    }
  }, [user]);

  // Only show projects with status "need_revision" (not "admin_revision")
  const grouped = {
    pending: [],
    endorsed: [],
    need_revision: [],
    approved: []
  };
  projects.forEach(project => {
    if (grouped[project.status]) grouped[project.status].push(project);
  });
  // Do NOT show admin_revision to students

  // Helper to render each group (for students only)
  const renderGroup = (title, statusKey) => (
    <div style={{ marginBottom: "2.5rem" }}>
      <div
        className="status-group-header"
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          gap: "0.7rem",
        }}
        onClick={() => setOpenGroups(prev => ({ ...prev, [statusKey]: !prev[statusKey] }))}
      >
        <img
          src={dropdownArrow}
          alt="toggle"
          style={{
            width: "20px",
            height: "20px",
            transition: "transform 0.2s",
            transform: openGroups[statusKey] ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
        <h4 style={{ color: "#2563eb", marginBottom: 0 }}>{title}</h4>
        <span style={{
          marginLeft: "0.7rem",
          color: "#888",
          fontWeight: 500,
          fontSize: "0.98rem"
        }}>
          ({grouped[statusKey].length})
        </span>
      </div>
      {openGroups[statusKey] && (
        grouped[statusKey].length === 0 ? (
          <div className="no-papers">No projects.</div>
        ) : (
          <ul className="my-papers-list">
            {grouped[statusKey].map(project => {
              const fullDocumentPath = project.documentPath;
              return (
                <li key={project.id} className="my-paper-item" onClick={() => navigate(`/projects/${project.id}`)}>
                  <div className="paper-title">{project.title}</div>
                  <div className="paper-meta">
                    <span
                      className="paper-category"
                      style={{
                        background: categoryColors[project.category] || "#2563eb",
                        color: "#fff"
                      }}
                    >
                      {project.category}
                    </span>
                  </div>
                  <div className="paper-authors-row">
                    <span className="paper-authors-label"><b>Authors:</b></span>
                    <span className="paper-authors">{project.authors}</span>
                  </div>
                  <div className="paper-abstract">
                    <b>Abstract:</b> {project.abstract.length > 120 ? project.abstract.slice(0, 120) + "..." : project.abstract}
                  </div>
                  <div className="paper-actions">
                    <a href={fullDocumentPath} target="_blank" rel="noopener noreferrer" className="view-pdf-btn">
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
        )
      )}
    </div>
  );

  // Two-column layout for eligible students
  if (user && user.role === "student" && isEligible(user)) {
    return (
      <div className="two-column-layout">
        <div className="account-info-col">
          <div className="account-header">
            <div className="account-avatar">
              {user.full_name ? user.full_name[0].toUpperCase() : "?"}
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
        </div>
        <div className="account-papers-col">
          <div className="account-papers-section">
            <h3>My Submitted Projects</h3>
            {renderGroup("Pending", "pending")}
            {renderGroup("Endorsed", "endorsed")}
            {renderGroup("Need Revision", "need_revision")}
            {renderGroup("Approved", "approved")}
          </div>
        </div>
      </div>
    );
  }

  // Single-column layout for ineligible students, admin, head_admin, research_adviser, guest
  return (
    <div className="my-account" style={{ maxWidth: 600, margin: "120px auto 40px auto" }}>
      <div className="account-header">
        <div className="account-avatar">
          {user.full_name ? user.full_name[0].toUpperCase() : "?"}
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
    </div>
  );
};

export default MyAccount;