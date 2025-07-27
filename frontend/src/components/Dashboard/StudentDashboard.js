import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./StudentDashboard.css";

const generateColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

const StudentDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [papers, setPapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAbstractId, setExpandedAbstractId] = useState(null);
  const [categoryColors, setCategoryColors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const PAGE_SIZE = 10;
  const location = useLocation();

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const cat = params.get("category");
  if (cat && categories.includes(cat)) {
    setSelectedCategory(cat);
  } else {
    setSelectedCategory("All");
  }
  // eslint-disable-next-line
}, [location.search, categories]);

  useEffect(() => {
  if (user && user.role === "student") {
    axios.get("/research/categories")
      .then(res => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }
}, [user]);

  useEffect(() => {
    axios.get("/research")
      .then(res => setPapers(res.data))
      .catch(() => setPapers([]));
  }, []);

  useEffect(() => {
    axios.get("/research/categories")
      .then(res => {
        const colors = {};
        res.data.categories.forEach(cat => {
          colors[cat] = generateColor(cat);
        });
        setCategoryColors(colors);
        setCategories(res.data.categories);
      });
  }, []);

  // Filter papers by search and category
  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All" || paper.category === selectedCategory)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPapers.length / PAGE_SIZE);
  const paginatedPapers = filteredPapers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ marginLeft: 260, width: "100%" }}>
        <div className="student-dashboard">
          <form className="search-form" onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search research papers by title"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>

          <div style={{ textAlign: "left", marginBottom: "2rem" }}>
            <label style={{ fontSize: "1.4rem", fontWeight: 600, color: "#2563eb", letterSpacing: "0.5px" }}>
              Research Project Repository
            </label>  
          </div>

          <div className="research-grid">
            {paginatedPapers.length === 0 ? (
              <div className="empty-state">
                <h3>No research papers found</h3>
                <p>There are no submissions yet. Be the first to upload your study!</p>
                <Link 
                  to="/submit-research" 
                  style={{ 
                    backgroundColor: "#b33834",
                    color: "white",            
                    padding: "10px 20px",      
                    border: "none",         
                    borderRadius: "5px",      
                    cursor: "pointer",         
                    fontSize: "16px",        
                    textDecoration: "none",     
                    display: "inline-block"     
                  }}
                >
                  Upload
                </Link>
              </div>
            ) : (
              paginatedPapers.map(paper => (
                <div
                  className="research-card clickable-card"
                  key={paper.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => window.location.href = `/projects/${paper.id}`}
                >
                  <h3 className="research-title">{paper.title}</h3>
                  <span
                    className="category-badge"
                    style={{
                      background: categoryColors[paper.category] || "#2563eb",
                      color: "#000",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      marginBottom: "1rem",
                      display: "inline-block"
                    }}
                  >
                    {paper.category}
                  </span>
                  <p className="authors"><b>Authors:</b> {paper.authors}</p>
                  <p className="abstract">
                    <b>Abstract:</b>{" "}
                    {expandedAbstractId === paper.id
                      ? paper.abstract
                      : paper.abstract.length > 180
                        ? paper.abstract.slice(0, 180) + "..."
                        : paper.abstract}
                    {paper.abstract.length > 180 && (
                      <span
                        className="read-more"
                        onClick={e => {
                          e.stopPropagation();
                          setExpandedAbstractId(
                            expandedAbstractId === paper.id ? null : paper.id
                          );
                        }}
                      >
                        {expandedAbstractId === paper.id ? "Show Less" : "Read More"}
                      </span>
                    )}
                  </p>
                  <span className="submission-date">
                    Uploaded: {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;