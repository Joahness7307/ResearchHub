import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./ResearchAdviserPage.css";
import categoryColors from "../../constants/categoryColors";

const projectsPerPage = 10;

// ✅ FIXED: SearchInput MOVED OUTSIDE
const SearchInput = ({ value, onChange }) => (
    <div className="search-wrapper" style={{ display: "flex", alignItems: "center", marginBottom: "2rem", marginTop: "1.5rem" }}>
        <input
            type="text"
            placeholder="Search projects by title, category, author, or abstract..."
            value={value}
            onChange={onChange}
            className="admin-search-input"
            style={{ marginRight: "1rem", flex: 1, padding: "1rem 1.3rem" }}
        />
        <button className="admin-btn search-button" style={{ padding: "1rem 1.3rem" }}>Search</button>
    </div>
);

const ResearchAdviserDashboard = ({ section }) => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRevisionCard, setSelectedRevisionCard] = useState("adviser");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const socketRef = useRef(null);

    // ✅ FIXED: Simple handler - NO useCallback needed
    const handleSearchChange = (e) => {
        setCurrentPage(1);
        setSearchTerm(e.target.value);
    };

    // Reset page when section changes
    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm("");
    }, [section, selectedRevisionCard]);

    // Data fetching (unchanged)
    useEffect(() => {
        if (user) {
            if (section === "repository") {
                axios.get("/projects").then(res => setProjects(res.data)).catch(() => setProjects([]));
            } else {
                axios.get("/projects/adviser/all").then(res => setProjects(res.data)).catch(() => setProjects([]));
            }
        }
    }, [user, section]);

    // Socket (unchanged)
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

    // Filtering logic (unchanged)
    const pending = projects.filter(p => p.status === "pending");
    const endorsed = projects.filter(p => p.status === "endorsed");
    const approved = projects.filter(p => p.status === "approved");
    const needRevision = projects.filter(p => p.status === "need_revision");
    const adminRevision = projects.filter(p => p.status === "admin_revision");
    const repository = approved;

    let projectsToFilter = [];
    if (section === "dashboard" || section === "pending") {
        projectsToFilter = pending;
    } else if (section === "endorsed") {
        projectsToFilter = endorsed;
    } else if (section === "approved") {
        projectsToFilter = approved;
    } else if (section === "repository") {
        projectsToFilter = repository;
    } else if (section === "request-for-revision") {
        projectsToFilter = selectedRevisionCard === "adviser" ? needRevision : adminRevision;
    }

    const filteredProjects = projectsToFilter.filter(project => {
        const term = searchTerm.toLowerCase();
        const titleMatch = project.title && project.title.toLowerCase().includes(term);
        const categoryMatch = project.category && project.category.toLowerCase().includes(term);
        const authorMatch = project.authors && project.authors.toLowerCase().includes(term);
        const abstractMatch = project.abstract && project.abstract.toLowerCase().includes(term);
        return titleMatch || categoryMatch || authorMatch || abstractMatch;
    });

    const totalProjects = filteredProjects.length;
    const totalPages = Math.ceil(totalProjects / projectsPerPage);
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
        if (totalPages === 0 && currentPage > 1) setCurrentPage(1);
    }, [currentPage, totalPages]);

    const sectionTitles = {
        dashboard: "Research Adviser Dashboard",
        pending: "Pending Projects",
        endorsed: "Endorsed Projects",
        approved: "Approved Projects",
        "request-for-revision": "Request for Revision",
        repository: "Project Repository",
    };

    const PaginationControls = () => (
        totalPages > 1 && (
            <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
                <button className="admin-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                </button>
                <span style={{ fontWeight: 600, fontSize: "1.1rem", alignSelf: 'center' }}>
                    Page {currentPage} of {totalPages}
                </span>
                <button className="admin-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                </button>
            </div>
        )
    );

    const ProjectList = ({ projects: listProjects }) => (
        listProjects.length === 0 ? (
            <div className="no-projects">No projects found.</div>
        ) : (
            <ul className="repository-list">
                {listProjects.map(project => (
                    <li key={project.id} className="repository-item" onClick={() => navigate(`/adviser/projects/${project.id}`)}>
                        <div className="repository-title">{project.title}</div>
                        <div className="repository-meta">
                            <span className="repository-category" style={{ background: categoryColors[project.category] || "#2563eb", color: "#fff" }}>
                                {project.category}
                            </span>
                            <span className="repository-authors">{project.authors}</span>
                        </div>
                        <div className="repository-abstract">
                            <b>Abstract:</b> {project.abstract?.length > 120 ? project.abstract.slice(0, 120) + "..." : project.abstract}
                        </div>
                    </li>
                ))}
            </ul>
        )
    );

    // Render sections (ALL using FIXED SearchInput)
    if (section === "request-for-revision") {
        return (
            <div className="adviser-dashboard-container" style={{ padding: "5rem 2rem" }}>
                <h2>{sectionTitles[section]}</h2>
                <div className="dashboard-card-row" style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
                    <div className={`dashboard-card${selectedRevisionCard === "adviser" ? " active" : ""}`} style={{ cursor: "pointer" }} onClick={() => setSelectedRevisionCard("adviser")}>
                        <h3>Research Adviser Request Revision</h3>
                        <div className="dashboard-card-count">{needRevision.length}</div>
                    </div>
                    <div className={`dashboard-card${selectedRevisionCard === "admin" ? " active" : ""}`} style={{ cursor: "pointer" }} onClick={() => setSelectedRevisionCard("admin")}>
                        <h3>Head Admin Request Revision</h3>
                        <div className="dashboard-card-count">{adminRevision.length}</div>
                    </div>
                </div>
                {/* ✅ FIXED */}
                <SearchInput value={searchTerm} onChange={handleSearchChange} />
                <div className="dashboard-main-content">
                    <ProjectList projects={paginatedProjects} />
                    <PaginationControls />
                </div>
            </div>
        );
    }

    if (section === "dashboard") {
        const pendingCount = pending.length;
        const endorsedCount = endorsed.length;
        const approvedCount = approved.length;
        const revisionCount = needRevision.length + adminRevision.length;
        const latestPending = pending.slice(0, 3);

        // ✅ FIXED: Filter latestPending by searchTerm
        const filteredLatestPending = latestPending.filter(project => {
            const term = searchTerm.toLowerCase();
            const titleMatch = project.title?.toLowerCase().includes(term);
            const categoryMatch = project.category?.toLowerCase().includes(term);
            const authorMatch = project.authors?.toLowerCase().includes(term);
            const abstractMatch = project.abstract?.toLowerCase().includes(term);
            return !searchTerm || titleMatch || categoryMatch || authorMatch || abstractMatch;
        });

        return (
            <div className="adviser-dashboard-container">
                <h2>{sectionTitles[section]}</h2>
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
                {/* ✅ FIXED: SearchInput + FILTERED Latest Pending */}
                <SearchInput value={searchTerm} onChange={handleSearchChange} />
                
                <h3 style={{ marginBottom: "1.2rem", color: "#333" }}>Latest Pending Projects</h3>
                <ProjectList projects={filteredLatestPending} />
                
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <button 
                        className="admin-btn" 
                        style={{ padding: "1rem 2rem", background: "#3a3e92", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }} 
                        onClick={() => navigate("/adviser/pending-projects")}
                    >
                        See All Pending Projects
                    </button>
                </div>
            </div>  
        );
    }

    // Default sections
    return (
        <div className="adviser-dashboard-container" style={{ padding: "5rem 2rem" }}>
            <h2>{sectionTitles[section] || "Research Adviser Dashboard"}</h2>
            {/* ✅ FIXED */}
            <SearchInput value={searchTerm} onChange={handleSearchChange} />
            <div className="dashboard-main-content">
                <ProjectList projects={paginatedProjects} />
                <PaginationControls />
            </div>
        </div>
    );
};

export default ResearchAdviserDashboard;