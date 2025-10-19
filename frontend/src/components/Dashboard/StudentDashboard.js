import React, { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
// NOTE: categoryColors is not provided, assuming it's correctly mapped in your constants
import categoryColors from "../../constants/categoryColors"; 

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [selectedCard, setSelectedCard] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        // Only fetch approved projects for the repository
        axios.get("/projects")
            .then(res => setProjects(res.data))
            .catch((err) => {
                console.error("Error fetching projects:", err);
                setProjects([]);
            });
    }, []);

    // Only approved projects
    const approvedProjects = projects.filter(project => project.status === "approved");

    // College projects: must have department and year_level, and NOT have strand/grade_level
    const collegeProjects = approvedProjects.filter(
        project =>
            project.submitter &&
            project.submitter.department && // Check if department has a value
            project.submitter.year_level && // Check if year_level has a value
            !project.submitter.strand && // Ensure SHS fields are not present
            !project.submitter.grade_level
    );

    // Senior high projects: must have strand and grade_level, and NOT have department/year_level
    const shsProjects = approvedProjects.filter(
        project =>
            project.submitter &&
            project.submitter.strand && // Check if strand has a value
            project.submitter.grade_level && // Check if grade_level has a value
            !project.submitter.department && // Ensure College fields are not present
            !project.submitter.year_level
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
                    <div className="dashboard-card-count">{allProjects.length}</div>
                </div>
                <div
                    className={`dashboard-card${selectedCard === "college" ? " active" : ""}`}
                    onClick={() => setSelectedCard("college")}
                >
                    <h3>College Department</h3>
                    <div className="dashboard-card-count">{collegeProjects.length}</div>
                </div>
                <div
                    className={`dashboard-card${selectedCard === "shs" ? " active" : ""}`}
                    onClick={() => setSelectedCard("shs")}
                >
                    <h3>Senior High Level</h3>
                    <div className="dashboard-card-count">{shsProjects.length}</div>
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
                                    <div className="repository-title">{project.title}</div>
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
                                        <span className="repository-authors">{project.authors}</span>
                                    </div>
                                    <div className="repository-abstract">
                                        <b>Abstract:</b> {project.abstract?.length > 120 ? project.abstract.slice(0, 120) + "..." : project.abstract}
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