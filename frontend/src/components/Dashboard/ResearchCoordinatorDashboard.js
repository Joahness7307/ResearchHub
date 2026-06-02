import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import NotificationPage from "./NotificationPage";
import "./AdminDashboard.css";
import categoryColors from "../../constants/categoryColors";
import "../Dashboard/StudentDashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { useWorkflowRefresh } from "../../hooks/useWorkflowRefresh";

// Search Bar Component
const SearchBar = ({ searchTerm, onSearchChange }) => (
  <div className="search-wrapper" style={{ display: "flex", alignItems: "center", margin: "1.5rem 0 2rem" }}>
    <input
      type="text"
      placeholder="Search projects by title, category, author, or abstract..."
      value={searchTerm}
      onChange={onSearchChange}
      className="admin-search-input"
      style={{ marginRight: "1rem", flex: 1, padding: "1rem 1.3rem" }}
    />
    <button className="admin-btn search-button" style={{ padding: "1rem 1.3rem" }}>
      Search
    </button>
  </div>
);

// Project List Component
const ProjectList = ({ projects, navigate, section, handleBookmarkToggle }) => (
  <ul className="repository-list">
    {projects.length === 0 ? (
      <div className="no-projects" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
        No projects found in this section.
      </div>
    ) : (
      projects.map((project) => (
        <li
          key={project.id}
          className="repository-item"
          onClick={() => navigate(`/research-coordinator/projects/${project.id}`)}
          style={{ position: "relative", cursor: "pointer" }}
        >
          {/* Bookmark Icon */}
          <img
            src={
              project.bookmarked
                ? require("../../assets/icons/bookmarked-icon.png")
                : require("../../assets/icons/bookmark-icon.png")
            }
            alt={project.bookmarked ? "Bookmarked" : "Bookmark"}
            className="bookmark-icon"
            style={{
              width: 24,
              height: 24,
              position: "absolute",
              top: 18,
              right: 18,
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleBookmarkToggle(e, project.id, project.bookmarked);
            }}
          />

          <div className="repository-title">{project.title}</div>
          {project.title_description && (
            <div className="repository-title-description adviser-title-desc">
              {project.title_description.length > 110 
                ? project.title_description.slice(0, 110) + "..." 
                : project.title_description}
            </div>
          )}

          <div className="repository-meta">
            <span
              className="repository-category"
              style={{
                background: categoryColors[project.category] || "#2563eb",
                color: "#fff",
                padding: "0.3rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
            >
              {project.category}
            </span>
            <span className="repository-authors"><i><span style={{fontWeight: 500}}>Authors: </span>{project.authors}</i></span>
          </div>

          <div className="repository-abstract research-coordinator-abstract-border">
            <b>Abstract:</b>{" "}
            {project.abstract?.length > 120
              ? project.abstract.slice(0, 120) + "..."
              : project.abstract || "No abstract available"}
          </div>

          {/* Comment Count (only in approved/repository) */}
          {["approved", "repository"].includes(section?.toLowerCase()) && (
            <div
              style={{
                position: "absolute",
                right: 18,
                bottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <img
                src={require("../../assets/icons/comment-icon.png")}
                alt="Comments"
                style={{ width: 20, height: 20, opacity: 0.8 }}
              />
              <span style={{ fontWeight: 500, color: "#2563eb", fontSize: 15 }}>
                {project.comment_count ?? 0}
              </span>
            </div>
          )}
        </li>
      ))
    )}
  </ul>
);

const projectsPerPage = 10;

const ResearchCoordinatorDashboard = ({ section }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [_bookmarkedProjects, setBookmarkedProjects] = useState([]);

  const selectedCard = section || "dashboard";

  // Handle bookmark toggle
    const handleBookmarkToggle = async (e, projectId, isBookmarked) => {
    e.stopPropagation();

    try {
        if (isBookmarked) {
        // Remove bookmark
        await axios.delete(API_ROUTES.bookmarks.toggleBookmark(projectId));  // ← Fixed
        setBookmarkedProjects((prev) => prev.filter((id) => id !== projectId));
        } else {
        // Add bookmark
        await axios.post(API_ROUTES.bookmarks.toggleBookmark(projectId));   // ← Fixed (no body needed)
        setBookmarkedProjects((prev) => [...prev, projectId]);
        }

        // Update UI instantly
        setProjects((prev) =>
        prev.map((p) =>
            p.id === projectId ? { ...p, bookmarked: !isBookmarked } : p
        )
        );
    } catch (error) {
        console.error("Failed to toggle bookmark:", error);
        alert("Failed to update bookmark. Please try again.");
    }
    };

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Force password change redirect
  useEffect(() => {
    if (user?.force_password_change) {
      navigate("/force-change-password");
    }
  }, [user, navigate]);

  // Reset page on section change
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [selectedCard]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get(API_ROUTES.research_coordinator.getAllProjects);
      const data = res.data;

      const bookmarkRes = await axios.get(API_ROUTES.bookmarks.getMyBookmarks);
      const bookmarkedIds = bookmarkRes.data.map((project) => project.id);

      const projectsWithBookmarkStatus = data.map((project) => ({
        ...project,
        bookmarked: bookmarkedIds.includes(project.id),
      }));

      setProjects(projectsWithBookmarkStatus);
      setBookmarkedProjects(bookmarkedIds);
    } catch (err) {
      console.error("Failed to load projects or bookmarks:", err);
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user, fetchProjects]);

  useWorkflowRefresh({
    onProjectsRefresh: fetchProjects,
  });

  // Filter & Pagination Logic
  const {
    pendingProjects,
    approvedProjects,
    revisionProjects,
    repositoryProjects,
    totalPages,
    paginatedProjects,
  } = useMemo(() => {
    const pending = projects.filter((p) => p.status === "endorsed");
    const approved = projects.filter((p) => p.status === "approved");
    const revision = projects.filter(
      (p) => p.status === "admin_revision" && p.last_updated_by_role === "research_coordinator"
    );
    const repository = approved;

    let displayProjects = [];
    if (["dashboard", "pending"].includes(selectedCard)) displayProjects = pending;
    else if (selectedCard === "approved") displayProjects = approved;
    else if (selectedCard === "revision") displayProjects = revision;
    else if (selectedCard === "repository") displayProjects = repository;

    const filtered = displayProjects.filter((project) => {
      const term = searchTerm.toLowerCase();
      return (
        project.title?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term) ||
        project.authors?.toLowerCase().includes(term) ||
        project.abstract?.toLowerCase().includes(term)
      );
    });

    const totalPagesCount = Math.ceil(filtered.length / projectsPerPage);
    const start = (currentPage - 1) * projectsPerPage;
    const paginated = filtered.slice(start, start + projectsPerPage);

    return {
      pendingProjects: pending,
      approvedProjects: approved,
      revisionProjects: revision,
      repositoryProjects: repository,
      totalPages: totalPagesCount || 1,
      paginatedProjects: paginated,
    };
  }, [projects, selectedCard, searchTerm, currentPage]);

  // Clamp currentPage
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage((c) => c - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage((c) => c + 1);

  const PaginationControls = () =>
    totalPages > 1 ? (
      <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2.5rem" }}>
        <button className="admin-btn" disabled={currentPage === 1} onClick={handlePrevPage}>
          Previous
        </button>
        <span style={{ alignSelf: "center", fontWeight: "600", color: "#333" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button className="admin-btn" disabled={currentPage === totalPages} onClick={handleNextPage}>
          Next
        </button>
      </div>
    ) : null;

  const latestPending = pendingProjects.slice(0, 3);

  return (
    <div className="research-coordinator-dashboard-wrapper">
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "2rem 0rem",
        }}
      >
        {/* Dashboard Home */}
        {selectedCard === "dashboard" && (
          <>
            <h2 style={{ margin: "4rem 0 2rem", fontSize: "2rem", color: "#1e293b" }}>
              Research Coordinator Dashboard
            </h2>

            <div className="dashboard-cards-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
              <div className="dashboard-card" onClick={() => navigate("/research-coordinator/pending-projects")}>
                <h3>Pending Projects</h3>
                <div className="dashboard-card-count">{pendingProjects.length}</div>
              </div>
              <div className="dashboard-card" onClick={() => navigate("/research-coordinator/approved-projects")}>
                <h3>Approved Projects</h3>
                <div className="dashboard-card-count">{approvedProjects.length}</div>
              </div>
              <div className="dashboard-card" onClick={() => navigate("/research-coordinator/request-for-revision")}>
                <h3>Request for Revision</h3>
                <div className="dashboard-card-count">{revisionProjects.length}</div>
              </div>
              <div className="dashboard-card" onClick={() => navigate("/research-coordinator/repository")}>
                <h3>Repository Projects</h3>
                <div className="dashboard-card-count">{repositoryProjects.length}</div>
              </div>
            </div>

            <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

            <h3 style={{ margin: "3rem 0 1.5rem", color: "#2563eb" }}>Latest Pending Projects</h3>

            <ProjectList
              projects={latestPending.filter((p) => {
                const t = searchTerm.toLowerCase();
                return (
                  p.title?.toLowerCase().includes(t) ||
                  p.category?.toLowerCase().includes(t) ||
                  p.authors?.toLowerCase().includes(t) ||
                  p.abstract?.toLowerCase().includes(t)
                );
              })}
              navigate={navigate}
              section="pending"
              handleBookmarkToggle={handleBookmarkToggle}
            />

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <button
                className="admin-btn"
                style={{
                  padding: "1rem 2.5rem",
                  background: "#3a3e92",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
                onClick={() => navigate("/research-coordinator/pending-projects")}
              >
                See All Pending Projects
              </button>
            </div>
          </>
        )}

        {/* Other Sections */}
        {["pending", "approved", "revision", "repository"].includes(selectedCard) && (
          <>
            <h2 style={{ margin: "4rem 0 2rem", fontSize: "2rem" }}>
              {selectedCard === "pending" && `Pending Projects (${pendingProjects.length})`}
              {selectedCard === "approved" && `Approved Projects (${approvedProjects.length})`}
              {selectedCard === "revision" && `Request for Revision (${revisionProjects.length})`}
              {selectedCard === "repository" && `Project Repository (${repositoryProjects.length})`}
            </h2>

            <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

            <ProjectList
              projects={paginatedProjects}
              navigate={navigate}
              section={selectedCard}
              handleBookmarkToggle={handleBookmarkToggle} // Fixed: Now passed everywhere
            />

            <PaginationControls />
          </>
        )}

        {selectedCard === "notifications" && <NotificationPage />}
      </div>
    </div>
  );
};

export default ResearchCoordinatorDashboard;
