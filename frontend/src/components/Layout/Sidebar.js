import React, { useContext, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import appLogo from '../../assets/appLogo.png';
import "./Sidebar.css";

const Sidebar = ({ onCategorySelect, selectedCategory, categories }) => {
  const { user } = useContext(AuthContext);
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine logo link destination
    let logoLink = "/"; // Default for unauthenticated users
    if (user) { // If user is logged in
      if (user.role === "student") logoLink = "/projects"; // Assuming /projects is student dashboard
      else if (user.role === "admin") logoLink = "/admin";
    }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate("/projects")}>
        {user ? (
          <Link to={logoLink}> {/* Use Link for authenticated user's dashboard */}
            <img src={appLogo} alt="Research Hub Logo" className="app-logo" />
          </Link>
        ) : (
            <a href="/" onClick={e => { e.preventDefault(); navigate("/"); }}>
              {/* ... */}
            </a>
        )}
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-item">
          <button
            className={`sidebar-btn${showCategories ? " active" : ""}`}
            onClick={() => setShowCategories((prev) => !prev)}
          >
            <span role="img" aria-label="projects">📚</span> Projects
            <span className="sidebar-caret">{showCategories ? "▲" : "▼"}</span>
          </button>
          {showCategories && (
            <ul className="sidebar-dropdown">
              <li
                className={selectedCategory === "All" ? "active" : ""}
                onClick={() => {
                  onCategorySelect("All");
                  setShowCategories(false);
                  navigate("/projects");
                }}
              >
                All
              </li>
              {categories.map((cat) => (
                <li
                  key={cat}
                  className={selectedCategory === cat ? "active" : ""}
                  onClick={() => {
                    onCategorySelect(cat);
                    setShowCategories(false);
                    navigate("/projects");
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className={`sidebar-btn${location.pathname === "/submit-research" ? " active" : ""}`}
          onClick={() => navigate("/submit-research")}
        >
          <span role="img" aria-label="upload">⬆️</span> Upload Research
        </button>
        <button
          className={`sidebar-btn${location.pathname === "/my-account" ? " active" : ""}`}
          onClick={() => navigate("/my-account")}
        >
          <span role="img" aria-label="account">👤</span> My Account
        </button>
        <button
          className="sidebar-btn logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
            window.location.reload();
          }}
        >
          <span role="img" aria-label="logout">🚪</span> Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;