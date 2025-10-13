import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./ResearchAdviserPage.css"; // Corrected file name
import categoryColors from "../../constants/categoryColors";

const ResearchAdviserDashboard = ({ section }) => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRevisionCard, setSelectedRevisionCard] = useState("adviser");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // --- Data Fetching ---
  useEffect(() => {
    if (user) {
      if (section === "repository") {
        // Fetch all approved projects for the repository
        axios.get("/projects")
          .then(res => setProjects(res.data))
          .catch(() => setProjects([]));
      } else {
        // Fetch all projects assigned to the adviser
        axios.get("/projects/adviser/all")
          .then(res => setProjects(res.data))
          .catch(() => setProjects([]));
      }
    }
  }, [user, section]);

  // --- Real-time Notifications ---
  useEffect(() => {
    if (!user || !process.env.REACT_APP_BACKEND_URL) return;
    socketRef.current = io(process.env.REACT_APP_BACKEND_URL);
    socketRef.current.on(`adviser_notify_${user.id}`, (data) => {
      alert(`${data.message}`);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  // --- Reset Pagination/Search on Section Change ---
  useEffect(() => {
    // Reset currentPage and searchTerm when the section or revision card changes
    setCurrentPage(1);
    setSearchTerm("");
  }, [section, selectedRevisionCard]);

  // --- Project Filtering (Status) ---
  const pending = projects.filter(p => p.status === "pending");
  // Assuming 'endorsed' projects belong to this adviser
  const endorsed = projects.filter(p => p.status === "endorsed");
  const needRevision = projects.filter(p => p.status === "need_revision");
  const adminRevision = projects.filter(p => p.status === "admin_revision");
  const repository = projects.filter(p => p.status === "approved");

  // --- Determine Projects for Current Section (Before Search/Pagination) ---
  let projectsToFilter = [];
  if (section === "dashboard" || section === "pending") {
    projectsToFilter = pending;
  } else if (section === "endorsed" || section === "approved") {
    projectsToFilter = endorsed;
  } else if (section === "repository") {
    projectsToFilter = repository;
  } else if (section === "request-for-revision") {
    // Filter by the selected card for the revision section
    projectsToFilter = selectedRevisionCard === "adviser" ? needRevision : adminRevision;
  }

  // --- Search Filtering (Applies to all sections) ---
  const filteredProjects = projectsToFilter.filter(project => {
    const term = searchTerm.toLowerCase();
    const titleMatch = project.title.toLowerCase().includes(term);
    const categoryMatch = project.category.toLowerCase().includes(term);
    const authorMatch = project.authors && project.authors.toLowerCase().includes(term);
    return titleMatch || categoryMatch || authorMatch;
  });

  // --- Pagination Logic (Centralized) ---
  const totalProjects = filteredProjects.length;
  const totalPages = Math.ceil(totalProjects / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // --- Section Titles ---
  const sectionTitles = {
    dashboard: "Research Adviser Dashboard",
    pending: "Pending Projects",
    endorsed: "Endorsed Projects",
    approved: "Approved Projects",
    "request-for-revision": "Request for Revision",
    repository: "Project Repository",
  };

  // --- Pagination Controls Component ---
  const PaginationControls = () => (
    totalPages > 1 && (
      <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
        <button
          className="admin-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span style={{ fontWeight: 600, fontSize: "1.1rem", alignSelf: 'center' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="admin-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    )
  );

  // --- Project List Component ---
  const ProjectList = ({ projects: listProjects }) => (
    listProjects.length === 0 ? (
      <div className="no-projects">No projects found.</div>
    ) : (
      <ul className="repository-list">
        {listProjects.map(project => (
          <li
            key={project.id}
            className="repository-item"
            onClick={() => navigate(`/adviser/projects/${project.id}`)}
          >
            <div className="repository-title">{project.title}</div>
            <div className="repository-meta">
              <span
                className="repository-category"
                style={{
                  background: categoryColors[project.category] || "#2563eb",
                  color: "#fff"
                }}
              >
                {project.category}
              </span>
              <span className="repository-authors">{project.authors}</span>
            </div>
            <div className="repository-abstract">
              <b>Abstract:</b> {project.abstract.length > 120 ? project.abstract.slice(0, 120) + "..." : project.abstract}
            </div>
          </li>
        ))}
      </ul>
    )
  );

  // --- Search Input Component ---
  const SearchInput = ({ value, onChange }) => (
    <div className="search-wrapper" style={{ display: "flex", alignItems: "center", marginBottom: "2rem", marginTop: "1.5rem" }}>
      <input
        type="text"
        placeholder="Search projects..."
        value={value}
        onChange={onChange}
        className="admin-search-input"
        style={{ marginRight: "1rem", flex: 1, padding: "1rem 1.3rem" }}
      />
      <button className="admin-btn search-button" onClick={() => {}} style={{ padding: "1rem 1.3rem" }}>Search</button>
    </div>
  );


  // =========================================================
  // Render: Request for Revision (Custom Layout)
  // =========================================================
  if (section === "request-for-revision") {
    return (
      <div className="adviser-dashboard-container" style={{ padding: "5rem 2rem" }}>
        <h2 style={{ marginBottom: 20 }}>{sectionTitles[section]}</h2>
        <div className="dashboard-card-row" style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
          <div
            className={`dashboard-card${selectedRevisionCard === "adviser" ? " active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedRevisionCard("adviser")}
          >
            <h3>Research Adviser Request Revision</h3>
            <div className="dashboard-card-count">{needRevision.length}</div>
          </div>
          <div
            className={`dashboard-card${selectedRevisionCard === "admin" ? " active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedRevisionCard("admin")}
          >
            <h3>Head Admin Request Revision</h3>
            <div className="dashboard-card-count">{adminRevision.length}</div>
          </div>
        </div>

        {/* Search Input for Revision Section (uses main searchTerm state) */}
        <SearchInput
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="dashboard-main-content">
          <ProjectList projects={paginatedProjects} />
          <PaginationControls />
        </div>
      </div>
    );
  }

  // =========================================================
  // Render: Dashboard (Quick Stats & Latest)
  // =========================================================
  if (section === "dashboard") {
    const pendingCount = pending.length;
    const endorsedCount = endorsed.length;
    const approvedCount = repository.length;
    const revisionCount = needRevision.length + adminRevision.length;
    const latestPending = pending.slice(0, 3); // Display top 3 for dashboard view

    return (
      <div className="adviser-dashboard-container">
        <h2>{sectionTitles[section]}</h2>
        {/* Quick Stats Row */}
        <div className="dashboard-cards-row" style={{ marginBottom: "2.5rem" }}>
          <div className="dashboard-card" onClick={() => navigate("/adviser/pending-projects")}>
            <h3>Pending Projects</h3>
            <div className="dashboard-card-count">{pendingCount}</div>
          </div>
          <div className="dashboard-card" onClick={() => navigate("/adviser/endorsed-projects")}>
            <h3>Endorsed Projects</h3>
            <div className="dashboard-card-count">{endorsedCount}</div>
          </div>
          <div className="dashboard-card" onClick={() => navigate("/adviser/approved-projects")}>
            <h3>Approved Projects</h3>
            <div className="dashboard-card-count">{approvedCount}</div>
          </div>
          <div className="dashboard-card" onClick={() => navigate("/adviser/request-for-revision")}>
            <h3>Revision Requests</h3>
            <div className="dashboard-card-count">{revisionCount}</div>
          </div>
        </div>

        {/* Search Input for dashboard (only affects "See All" view later, but here for consistency) */}
        <SearchInput
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* Latest Pending Projects */}
        <h3 style={{ marginBottom: "1.2rem", color: "#333" }}>Latest Pending Projects</h3>
        <ProjectList projects={latestPending} />

        {/* See All Pending Projects Button */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            className="admin-btn"
            style={{
              padding: "1rem 2rem",
              background: "#3a3e92",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer"
            }}
            onClick={() => navigate("/adviser/pending-projects")}
          >
            See All Pending Projects
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // Render: Default Section (Pending, Endorsed, Repository)
  // =========================================================
  return (
    <div className="adviser-dashboard-container" style={{ padding: "5rem 2rem" }}>
      <h2>{sectionTitles[section] || "Research Adviser Dashboard"}</h2>

      {/* Search Input */}
      <SearchInput
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <div className="dashboard-main-content">
        <ProjectList projects={paginatedProjects} />
        <PaginationControls />
      </div>
    </div>
  );
};

export default ResearchAdviserDashboard;