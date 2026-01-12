import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import commentIcon from "../../assets/commentIcon.png";
import bookmarkIcon from "../../assets/bookmarkIcon.png";
import bookmarkedIcon from "../../assets/bookmarkedIcon.png";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
// NOTE: categoryColors is not provided, assuming it's correctly mapped in your constants
import categoryColors from "../../constants/categoryColors"; 
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [selectedCard, setSelectedCard] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [counts, setCounts] = useState({ all: 0, college: 0, senior_high: 0 });
    const projectsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        // Only fetch approved projects for the repository
        axios.get("/projects")
            .then(async res => {
                const projectsData = res.data;
                // Fetch comment counts for each project
                const commentCountPromises = projectsData.map(project =>
                    axios.get(`/comments/${project.id}`)
                        .then(r => Array.isArray(r.data) ? r.data.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0) : 0)
                        .catch(() => 0)
                );
                // Fetch bookmark state for each project (if logged in)
                let bookmarkPromises = [];
                if (user) {
                    bookmarkPromises = projectsData.map(project =>
                        axios.get(`/bookmarks/is-bookmarked/${project.id}`)
                            .then(r => r.data.bookmarked)
                            .catch(() => false)
                    );
                } else {
                    bookmarkPromises = projectsData.map(() => false);
                }
                const [commentCounts, bookmarkStates] = await Promise.all([
                    Promise.all(commentCountPromises),
                    Promise.all(bookmarkPromises)
                ]);
                // Attach comment_count and bookmarked to each project
                const projectsWithCounts = projectsData.map((project, idx) => ({
                    ...project,
                    comment_count: commentCounts[idx],
                    bookmarked: bookmarkStates[idx]
                }));
                setProjects(projectsWithCounts);
            })
            .catch((err) => {
                console.error("Error fetching projects:", err);
                setProjects([]);
            });
    }, [user]);

    // Fetch counts on mount
    useEffect(() => {
    axios.get("/projects/public/counts")
        .then(res => setCounts(res.data))
        .catch(() => setCounts({ all: 0, college: 0, senior_high: 0 }));
    }, []);

    // Only approved projects
    const approvedProjects = projects.filter(project => project.status === "approved");

    const collegeProjects = approvedProjects.filter(
    project => project.strand_id === null || project.strand_id === undefined
    );

    const shsProjects = approvedProjects.filter(
    project => project.strand_id !== null && project.strand_id !== undefined
    );

    // Card filters
    const allProjects = approvedProjects;

    let displayedProjects = [];
    if (selectedCard === "all") displayedProjects = allProjects;
    else if (selectedCard === "college") displayedProjects = collegeProjects;
    else if (selectedCard === "shs") displayedProjects = shsProjects;

    // Search filter
    const filteredProjects = displayedProjects.filter(project => {
        const term = searchTerm.toLowerCase();
        
        const titleMatch = project.title && project.title.toLowerCase().includes(term);
        const categoryMatch = project.category && project.category.toLowerCase().includes(term);
        
        // Match project authors field
        const authorMatch = project.authors && project.authors.toLowerCase().includes(term);
        
        // Match submitter full name (uploader)
        const uploaderMatch = 
            project.submitter &&
            project.submitter.full_name &&
            project.submitter.full_name.toLowerCase().includes(term);
        
        // ✨ FIX: Include abstract in search
        const abstractMatch = project.abstract && project.abstract.toLowerCase().includes(term);

        return titleMatch || categoryMatch || authorMatch || uploaderMatch || abstractMatch;
    });

    // Pagination logic
    const totalProjects = filteredProjects.length;
    const totalPages = Math.ceil(totalProjects / projectsPerPage);
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCard, searchTerm]);

    // Toggle bookmark handler
    const handleBookmarkToggle = async (e, projectId, bookmarked) => {
        e.stopPropagation();
        if (!user) {
            alert("You must be logged in to bookmark projects.");
            return;
        }
        try {
            if (bookmarked) {
                await axios.delete(`/bookmarks/${projectId}`);
            } else {
                await axios.post(`/bookmarks/${projectId}`);
            }
            // Update local state
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, bookmarked: !bookmarked } : p
            ));
        } catch (err) {
            alert("Failed to update bookmark. Please try again.");
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    };

    const projectCardClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    return (
        <div className="student-dashboard-container">
            <h2 style={{ marginBottom: '25px' }}>Research Project Repository</h2>
            <div className="dashboard-cards-row">
                <div
                    className={`dashboard-card${selectedCard === "all" ? " active" : ""}`}
                    onClick={() => setSelectedCard("all")}
                >
                    <h3>All Projects</h3>
                    <div className="dashboard-card-count">{counts.all}</div>
                </div>
                <div
                    className={`dashboard-card${selectedCard === "college" ? " active" : ""}`}
                    onClick={() => setSelectedCard("college")}
                >
                    <h3>College Department</h3>
                    <div className="dashboard-card-count">{counts.college}</div>
                </div>
                <div
                    className={`dashboard-card${selectedCard === "shs" ? " active" : ""}`}
                    onClick={() => setSelectedCard("shs")}
                >
                    <h3>Senior High Level</h3>
                    <div className="dashboard-card-count">{counts.senior_high}</div>
                </div>
            </div>

            <div className="dashboard-search-row">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search by title, category, author, or abstract..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="button"
                        className="search-button"
                        // ✨ FIX: Set currentPage to 1 on search button click
                        onClick={() => setCurrentPage(1)}
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="dashboard-main-content">
                {filteredProjects.length === 0 ? (
                    <div className="no-projects">No projects found.</div>
                ) : (
                    <>
                        <ul className="repository-list">
                            {paginatedProjects.map(project => (
                                <li
                                key={project.id}
                                className="repository-item"
                                onClick={() => projectCardClick(project.id)}
                                >
                                {/* Bookmark Icon */}
                                <div className="repository-bookmark-row">
                                    <img
                                    src={project.bookmarked ? bookmarkedIcon : bookmarkIcon}
                                    alt={project.bookmarked ? "Bookmarked" : "Bookmark"}
                                    className="bookmark-icon"
                                    onClick={(e) => handleBookmarkToggle(e, project.id, project.bookmarked)}
                                    />
                                </div>

                                <div className="repository-title">{project.title}</div>

                                 {project.title_description && (
                                    <div className="repository-title-description">
                                        {project.title_description.length > 100 
                                        ? project.title_description.slice(0, 100) + "..." 
                                        : project.title_description}
                                    </div>
                                )}
                                
                                <div className="repository-meta">
                                    <span
                                    className="repository-category"
                                    style={{
                                        background: categoryColors[project.category] || "#586b94ff",
                                        color: "#fff"
                                    }}
                                    >
                                    {project.category}
                                    </span>
                                    <span className="repository-authors"><i><span style={{fontWeight: 500}}>Authors: </span>{project.authors}</i></span>
                                </div>

                                <div className="repository-abstract">
                                    <b>Abstract:</b> {project.abstract?.length > 120 ? project.abstract.slice(0, 120) + "..." : project.abstract}
                                </div>

                                {/* Comment Icon + Count */}
                                <div className="repository-icons-row">
                                    <img src={commentIcon} alt="Comments" className="comment-icon" />
                                    <span className="comment-count">{project.comment_count ?? 0}</span>
                                </div>
                                </li>
                            ))}
                        </ul>

                        <div className="pagination-controls" style={{ textAlign: "center", marginTop: "2rem" }}>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: "0.7rem 1.5rem",
                                    marginRight: "1rem",
                                    background: "#3a3e92",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                    opacity: currentPage === 1 ? 0.6 : 1
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "#2563eb" }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                style={{
                                    padding: "0.7rem 1.5rem",
                                    marginLeft: "1rem",
                                    background: "#3a3e92",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    cursor: (currentPage === totalPages || totalPages === 0) ? "not-allowed" : "pointer",
                                    opacity: (currentPage === totalPages || totalPages === 0) ? 0.6 : 1
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;