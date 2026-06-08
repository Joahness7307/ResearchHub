import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { useNavigate } from "react-router-dom";
import { useWorkflowRefresh } from "../../hooks/useWorkflowRefresh";
import "./ResearchAdviserPage.css";
import categoryColors from "../../constants/categoryColors";

const projectsPerPage = 10;

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
    const [bookmarkLoading, setBookmarkLoading] = useState({});
    const navigate = useNavigate();

    const handleBookmarkToggle = async (e, projectId, bookmarked) => {
        e.stopPropagation();
        if (!user) {
            alert("You must be logged in to bookmark projects.");
            return;
        }
        setBookmarkLoading(prev => ({ ...prev, [projectId]: true }));
        try {
            if (bookmarked) {
                await axios.delete(API_ROUTES.bookmarks.toggleBookmark(projectId));
            } else {
                await axios.post(API_ROUTES.bookmarks.toggleBookmark(projectId));
            }
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, bookmarked: !bookmarked } : p
            ));

            // ADD THIS LINE — syncs other tabs/dashboards
            window.dispatchEvent(new Event("bookmarks-updated"));
        } catch (err) {
            alert("Failed to update bookmark. Please try again.");
        }
        setBookmarkLoading(prev => ({ ...prev, [projectId]: false }));
    };

    useEffect(() => {
        if (user && user.force_password_change) {
            navigate("/force-change-password");
        }
    }, [user, navigate]);

    const handleSearchChange = (e) => {
        setCurrentPage(1);
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm("");
    }, [section, selectedRevisionCard]);

    const fetchProjects = useCallback(async () => {
        if (!user) return;
        try {
            let res;
            if (section === "repository") {
                res = await axios.get(API_ROUTES.projects.getAllProjects);
            } else {
                res = await axios.get(API_ROUTES.research_adviser.getAllProjects);
            }

            const projectsData = res.data;

            const commentPromises = projectsData.map((project) =>
                axios
                    .get(API_ROUTES.comments.getByProject(project.id))
                    .then((r) => {
                        if (!Array.isArray(r.data)) return 0;
                        return r.data.reduce(
                            (total, comment) =>
                                total + 1 + (comment.replies?.length || 0),
                            0
                        );
                    })
                    .catch(() => 0)
            );

            const bookmarkPromises = projectsData.map((project) =>
                axios
                    .get(API_ROUTES.bookmarks.getBookmarkState(project.id))
                    .then((r) => r.data.bookmarked)
                    .catch(() => false)
            );

            const [commentCounts, bookmarkStates] = await Promise.all([
                Promise.all(commentPromises),
                Promise.all(bookmarkPromises),
            ]);

            const projectsWithData = projectsData.map((project, idx) => ({
                ...project,
                comment_count: commentCounts[idx],
                bookmarked: bookmarkStates[idx],
            }));

            setProjects(projectsWithData);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setProjects([]);
        }
    }, [user, section]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useWorkflowRefresh({
        onProjectsRefresh: fetchProjects,
    });

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
                    <li key={project.id} className="repository-item" onClick={() => navigate(`/research-adviser/projects/${project.id}`)} style={{ position: 'relative' }}>
                        {/* Bookmark Icon - Top Right */}
                        <img
                        src={project.bookmarked ? require("../../assets/icons/bookmarked-icon.png") : require("../../assets/icons/bookmark-icon.png")}
                        alt={project.bookmarked ? "Bookmarked" : "Bookmark"}
                        className={`bookmark-icon ${bookmarkLoading[project.id] ? "loading" : ""}`}
                        onClick={(e) => handleBookmarkToggle(e, project.id, project.bookmarked)}
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
                            <span className="repository-category" style={{ background: categoryColors[project.category] || "#2563eb", color: "#fff" }}>
                                {project.category}
                            </span>
                            <span className="repository-authors"><i><span style={{fontWeight: 500}}>Authors: </span>{project.authors}</i></span>
                        </div>
                        <div className="repository-abstract adviser-abstract-border">
                            <b>Abstract:</b> {project.abstract?.length > 120 ? project.abstract.slice(0, 120) + "..." : project.abstract}
                        </div>

                        {/* Comment Icon + Count - Bottom Right (Only on approved/repository) */}
                        {(section === "approved" || section === "repository") && (
                        <div className="comment-icon-container">
                            <img 
                            src={require("../../assets/icons/comment-icon.png")} 
                            alt="Comments" 
                            className="comment-icon" 
                            />
                            <span>{project.comment_count ?? 0}</span>
                        </div>
                        )}
                    </li>
                ))}
            </ul>
        )
    );

    // ... rest of your render logic (unchanged) ...
    if (section === "request-for-revision") {
        return (
            <div className="adviser-dashboard-container">
                <h2>{sectionTitles[section]}</h2>
                <div className="dashboard-card-row" style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
                    <div className={`dashboard-card${selectedRevisionCard === "adviser" ? " active" : ""}`} style={{ cursor: "pointer" }} onClick={() => setSelectedRevisionCard("adviser")}>
                        <h3>Research Adviser Request Revision</h3>
                        <div className="dashboard-card-count">{needRevision.length}</div>
                    </div>
                    <div className={`dashboard-card${selectedRevisionCard === "admin" ? " active" : ""}`} style={{ cursor: "pointer" }} onClick={() => setSelectedRevisionCard("admin")}>
                        <h3>Research Coordinator Request Revision</h3>
                        <div className="dashboard-card-count">{adminRevision.length}</div>
                    </div>
                </div>
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
                    <div className="dashboard-card" onClick={() => navigate("/research-adviser/pending-projects")}>
                        <h3>Pending Projects</h3>
                        <div className="dashboard-card-count">{pendingCount}</div>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate("/research-adviser/endorsed-projects")}>
                        <h3>Endorsed Projects</h3>
                        <div className="dashboard-card-count">{endorsedCount}</div>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate("/research-adviser/approved-projects")}>
                        <h3>Approved Projects</h3>
                        <div className="dashboard-card-count">{approvedCount}</div>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate("/research-adviser/request-for-revision")}>
                        <h3>Revision Requests</h3>
                        <div className="dashboard-card-count">{revisionCount}</div>
                    </div>
                </div>
                {/* ✅ FIXED: SearchInput + FILTERED Latest Pending */}
                <SearchInput value={searchTerm} onChange={handleSearchChange} />
                
                <h3 style={{ marginBottom: "1.2rem", color: "#333" }}>Latest Pending Projects</h3>
                <ProjectList projects={filteredLatestPending} />
                
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <button 
                        className="admin-btn" 
                        style={{ padding: "1rem 2rem", background: "#3a3e92", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }} 
                        onClick={() => navigate("/research-adviser/pending-projects")}
                    >
                        See All Pending Projects
                    </button>
                </div>
            </div>  
        );
    }

    return (
        <div className="adviser-dashboard-container">
            <h2>{sectionTitles[section] || "Research Adviser Dashboard"}</h2>
            <SearchInput value={searchTerm} onChange={handleSearchChange} />
            <div className="dashboard-main-content">
                <ProjectList projects={paginatedProjects} />
                <PaginationControls />
            </div>
        </div>
    );
};

export default ResearchAdviserDashboard;
