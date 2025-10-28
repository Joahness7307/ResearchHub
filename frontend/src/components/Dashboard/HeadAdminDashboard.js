import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeadAdminSideNavbar from "../Layout/HeadAdminSideNavbar";
import NotificationPage from "./NotificationPage";
import axios from "../../api/axios";
import "./AdminDashboard.css";
import categoryColors from "../../constants/categoryColors";
import "../Dashboard/StudentDashboard.css";
import HeadAdminLayout from "../Layout/HeadAdminLayout";

const projectsPerPage = 10;

// ✅ FIXED: SearchBar MOVED OUTSIDE - NO ERRORS
const SearchBar = ({ searchTerm, onSearchChange }) => (
    <div className="search-wrapper" style={{ display: "flex", alignItems: "center", marginBottom: "2rem", marginTop: "1.5rem" }}>
        <input
            type="text"
            placeholder="Search projects by title, category, author, or abstract..."
            value={searchTerm}
            onChange={onSearchChange}
            className="admin-search-input"
            style={{ marginRight: "1rem", flex: 1, padding: "1rem 1.3rem" }}
        />
        <button className="admin-btn search-button" style={{ padding: "1rem 1.3rem" }}>Search</button>
    </div>
);

// Reusable Project List Component
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

    // ✅ FIXED: Define handleSearchChange HERE
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    // ✅ FIXED: Define handleSearchClick HERE (for button if needed)
    const handleSearchClick = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Reset pagination when switching views
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCard]);

    // Fetch all projects
    useEffect(() => {
        axios.get("/projects/admin/all")
            .then(res => setProjects(res.data))
            .catch(() => setProjects([]));
    }, [location.pathname]);

    // Filter and pagination logic (unchanged)
    const {
        pendingProjects,
        approvedProjects,
        revisionProjects,
        repositoryProjects,
        totalPages,
        paginatedProjects
    } = useMemo(() => {
        const pending = projects.filter(p => p.status === "endorsed");
        const approved = projects.filter(p => p.status === "approved");
        const revision = projects.filter(
            p => p.status === "admin_revision" && p.last_updated_by_role === "head_admin"
        );
        const repository = approved;

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
            dispProjects = projects;
        }

        const filtered = dispProjects.filter(project => {
            const term = searchTerm.toLowerCase();
            const titleMatch = project.title && project.title.toLowerCase().includes(term);
            const categoryMatch = project.category && project.category.toLowerCase().includes(term);
            const authorMatch = project.authors && project.authors.toLowerCase().includes(term);
            const abstractMatch = project.abstract && project.abstract.toLowerCase().includes(term);
            return titleMatch || categoryMatch || authorMatch || abstractMatch;
        });

        const total = filtered.length;
        const totalPagesCount = Math.ceil(total / projectsPerPage);
        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);

        return {
            pendingProjects: pending,
            approvedProjects: approved,
            revisionProjects: revision,
            repositoryProjects: repository,
            totalPages: totalPagesCount,
            paginatedProjects: paginated,
        };
    }, [projects, selectedCard, searchTerm, currentPage]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Clamp currentPage
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
        if (totalPages === 0 && currentPage > 1) setCurrentPage(1);
    }, [currentPage, totalPages]);

    // Pagination handlers
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

    // Pagination Controls Component
    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
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

    const latestPending = pendingProjects.slice(0, 3);

    return (
        <div className="head-admin-dashboard-wrapper">
            <div style={{
                maxWidth: "1400px",
                margin: "0 auto",
                minHeight: "100vh",
                background: "#f9f9ff17"
            }}>
                {/* Dashboard */}
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

                       {/* ✅ FIXED: SearchBar + FILTERED Latest Pending */}
                        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                        <h3 style={{ marginBottom: "1.2rem", marginTop: "3rem", color: "#2563eb" }}>
                            Latest Pending Projects
                        </h3>
                        
                        {/* ✅ FIXED: Filter latestPending by searchTerm */}
                        <ProjectList 
                            projects={latestPending.filter(project => {
                                const term = searchTerm.toLowerCase();
                                const titleMatch = project.title?.toLowerCase().includes(term);
                                const categoryMatch = project.category?.toLowerCase().includes(term);
                                const authorMatch = project.authors?.toLowerCase().includes(term);
                                const abstractMatch = project.abstract?.toLowerCase().includes(term);
                                return !searchTerm || titleMatch || categoryMatch || authorMatch || abstractMatch;
                            })} 
                            navigate={navigate} 
                        />
                        
                        <div style={{ textAlign: "center", marginTop: "2rem" }}>
                            <button
                                className="admin-btn"
                                style={{ padding: "1rem 2rem", background: "#3a3e92", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "1.1rem", cursor: "pointer" }}
                                onClick={() => navigate("/head-admin/pending-projects")}
                            >
                                See All Pending Projects
                            </button>
                        </div>
                    </>
                )}

                {/* All Other Sections - SAME STRUCTURE */}
                {selectedCard === "pending" && (
                    <>
                        <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Pending Projects ({pendingProjects.length})</h2>
                        {/* ✅ FIXED: Pass props correctly */}
                        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                        <ProjectList projects={paginatedProjects} navigate={navigate} />
                        <PaginationControls />
                    </>
                )}

                {selectedCard === "approved" && (
                    <>
                        <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Approved Projects ({approvedProjects.length})</h2>
                        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                        <ProjectList projects={paginatedProjects} navigate={navigate} />
                        <PaginationControls />
                    </>
                )}

                {selectedCard === "revision" && (
                    <>
                        <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Request for Revision ({revisionProjects.length})</h2>
                        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                        <ProjectList projects={paginatedProjects} navigate={navigate} />
                        <PaginationControls />
                    </>
                )}

                {selectedCard === "repository" && (
                    <>
                        <h2 style={{ marginTop: "5rem", marginBottom: "2rem" }}>Project Repository ({repositoryProjects.length})</h2>
                        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
                        <ProjectList projects={paginatedProjects} navigate={navigate} />
                        <PaginationControls />
                    </>
                )}

                {selectedCard === "notifications" && <NotificationPage />}
            </div>
        </div>
    );
};

export default HeadAdminDashboard;