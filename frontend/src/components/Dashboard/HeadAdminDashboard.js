import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeadAdminSideNavbar from "../Layout/HeadAdminSideNavbar";
import NotificationPage from "./NotificationPage";
import axios from "../../api/axios";
import "./AdminDashboard.css";
import categoryColors from "../../constants/categoryColors";          
import "../Dashboard/StudentDashboard.css"; // Reuse student styles for project cards
import HeadAdminLayout from "../Layout/HeadAdminLayout";

const projectsPerPage = 10;

// Reusable Project List Component for cleanliness and DRY principle
const ProjectList = ({ projects, navigate }) => (
  <ul className="repository-list">
    {projects.length === 0 ? (
      <div className="no-projects" style={{ textAlign: "center", padding: "2rem" }}>No projects found in this section.</div>
    ) : (
      projects.map(project => (
        <li
          key={project.id}
          className="repository-item"
          onClick={() => navigate(`/head-admin/projects/${project.id}`)}
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
            <b>Abstract:</b> {project.abstract?.length > 120 ? project.abstract.slice(0, 120) + "..." : project.abstract}
          </div>
        </li>
      ))
    )}
  </ul>
);

const HeadAdminDashboard = ({ section }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const selectedCard = section || "dashboard";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();

  // Reset pagination when switching views
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCard]);

  // Fetch all projects on initial load and path change
  useEffect(() => {
    axios.get("/projects/admin/all")
      .then(res => setProjects(res.data))
      .catch(() => setProjects([]));
  }, [location.pathname]);

  // Use useMemo to filter projects based on status and search term
  const {
    allProjects,
    pendingProjects,
    approvedProjects,
    revisionProjects,
    repositoryProjects,
    displayedProjects,
    filteredProjects,
    totalPages,
    paginatedProjects
  } = useMemo(() => {
    // 1. Status groups
    const all = projects;
    const pending = projects.filter(p => p.status === "endorsed");
    const approved = projects.filter(p => p.status === "approved");
    const revision = projects.filter(
      p => p.status === "admin_revision" && p.last_updated_by_role === "head_admin"
    );
    // Repository projects are the same as approved projects
    const repository = approved;

    // 2. Determine which group to display
    let dispProjects = [];
    if (selectedCard === "dashboard" || selectedCard === "pending") {
      dispProjects = pending;
    } else if (selectedCard === "approved") {
      dispProjects = approved;
    } else if (selectedCard === "revision") {
      dispProjects = revision;
    } else if (selectedCard === "repository") {
      dispProjects = repository;
    } else {
      dispProjects = all; // Fallback, but all list sections are covered
    }

    // 3. Filter projects for search
    const filtered = dispProjects.filter(project => {
      const titleMatch = project.title && project.title.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = project.category && project.category.toLowerCase().includes(searchTerm.toLowerCase());
      const authorMatch = project.authors && project.authors.toLowerCase().includes(searchTerm.toLowerCase());
      return titleMatch || categoryMatch || authorMatch;
    });

    // 4. Pagination
    const total = filtered.length;
    const totalPagesCount = Math.ceil(total / projectsPerPage);
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    // Ensure currentPage doesn't exceed new totalPages after filtering/search
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
        setCurrentPage(totalPagesCount);
    } else if (currentPage > 1 && totalPagesCount === 0) {
        setCurrentPage(1); // Reset page if search yields no results
    }


    return {
      allProjects: all,
      pendingProjects: pending,
      approvedProjects: approved,
      revisionProjects: revision,
      repositoryProjects: repository,
      displayedProjects: dispProjects,
      filteredProjects: filtered,
      totalPages: totalPagesCount,
      paginatedProjects: paginated,
    };
  }, [projects, selectedCard, searchTerm, currentPage]); // Re-calculate when these change

  // Latest 3 pending projects for the dashboard view
  const latestPending = pendingProjects.slice(0, 3);
  
  // Handlers for pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // This function is for the search button, which essentially just triggers the memo re-calculation
  const handleSearchClick = () => {
    // Re-evaluates filteredProjects via useMemo
    setCurrentPage(1); // Reset to page 1 on new search
  };


  // Helper component for the search bar (to reduce duplication)
  const SearchBar = () => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem", marginTop: "1.5rem" }}>
      <input
        type="text"
        placeholder="Search projects by title, category, or author..."
        value={searchTerm}
        onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to page 1 on typing a new search
        }}
        className="admin-search-input"
        style={{ marginRight: "1rem", flex: 1, padding: "1rem 1.3rem" }}
      />
      {/* Search button is not strictly necessary as search updates on change, but kept for UX consistency */}
      <button className="admin-btn" onClick={handleSearchClick} style={{ padding: "1rem 1.3rem" }}>Search</button>
    </div>
  );

  // Helper component for pagination controls
  const PaginationControls = () => {
    // Only show if there's more than one page of filtered results
    if (totalPages <= 1) return null;

    return (
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
        <button
          className="admin-btn"
          disabled={currentPage === 1}
          onClick={handlePrevPage}
          style={{ padding: "0.75rem 1.5rem" }}
        >
          Previous
        </button>
        <span style={{ fontWeight: 600, fontSize: "1.1rem", alignSelf: "center" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="admin-btn"
          disabled={currentPage === totalPages}
          onClick={handleNextPage}
          style={{ padding: "0.75rem 1.5rem" }}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Main Layout */}
      <div>
        <div style={{
          maxWidth: "1200px", // Keep max-width to constrain content on large screens
          margin: "0 auto", // THIS CENTERS the content within the available space
          minHeight: "100vh",
          padding: "2.5rem 2.5rem",
          background: "#f9f9ff17"
        }}>
          {/* Dashboard Cards and Latest Pending Projects */}
          {selectedCard === "dashboard" && (
            <>
              <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Head Admin Dashboard</h2>
              <div className="dashboard-cards-row">
                <div className="dashboard-card" onClick={() => navigate("/head-admin/pending-projects")}>
                  <h3>Pending Projects</h3>
                  <div className="dashboard-card-count">{pendingProjects.length}</div>
                </div>
                <div className="dashboard-card" onClick={() => navigate("/head-admin/approved-projects")}>
                  <h3>Approved Projects</h3>
                  <div className="dashboard-card-count">{approvedProjects.length}</div>
                </div>
                <div className="dashboard-card" onClick={() => navigate("/head-admin/request-for-revision")}>
                  <h3>Request for Revision</h3>
                  <div className="dashboard-card-count">{revisionProjects.length}</div>
                </div>
                <div className="dashboard-card" onClick={() => navigate("/head-admin/repository")}>
                  <h3>Repository Projects</h3>
                  <div className="dashboard-card-count">{repositoryProjects.length}</div>
                </div>
              </div>

              {/* Latest Pending Projects */}
              <h3 style={{ marginBottom: "1.2rem", marginTop: "3rem", color: "#2563eb" }}>Latest Pending Projects</h3>
              <ProjectList projects={latestPending} navigate={navigate} />

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
                    fontSize: "1.1rem",
                    cursor: "pointer"
                  }}
                  onClick={() => navigate("/head-admin/pending-projects")}
                >
                  See All Pending Projects
                </button>
              </div>
            </>
          )}

          {/* Pending Projects */}
          {selectedCard === "pending" && (
            <>
              <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Pending Projects ({pendingProjects.length})</h2>
              <SearchBar />
              <ProjectList projects={paginatedProjects} navigate={navigate} />
              <PaginationControls />
            </>
          )}

          {/* Approved Projects */}
          {selectedCard === "approved" && (
            <>
              <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Approved Projects ({approvedProjects.length})</h2>
              <SearchBar />
              <ProjectList projects={paginatedProjects} navigate={navigate} />
              <PaginationControls />
            </>
          )}

          {/* Request for Revision */}
          {selectedCard === "revision" && (
            <>
              <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Request for Revision ({revisionProjects.length})</h2>
              <SearchBar />
              <ProjectList projects={paginatedProjects} navigate={navigate} />
              <PaginationControls />
            </>
          )}

          {/* Project Repository */}
          {selectedCard === "repository" && (
            <>
              <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Project Repository ({repositoryProjects.length})</h2>
              <SearchBar />
              <ProjectList projects={paginatedProjects} navigate={navigate} />
              <PaginationControls />
            </>
          )}

          {/* Notifications */}
          {selectedCard === "notifications" && (
            <NotificationPage />
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadAdminDashboard;