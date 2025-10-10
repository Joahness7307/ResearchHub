// ResearchAdviserLayout.js - COMPLETED FILE
import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ResearchAdviserSideNavbar from "./ResearchAdviserSideNavbar";
import Navbar from "./Navbar";
import "./DashboardLayout.css";

const adviserLinks = [
  { label: "Dashboard", to: "/adviser" },
  { label: "Pending Projects", to: "/adviser/pending-projects" },
  { label: "Endorsed Projects", to: "/adviser/approved-projects" },
  { label: "Request for Revision", to: "/adviser/request-for-revision" },
  { label: "Project Repository", to: "/adviser/repository" },
  { label: "Notifications", to: "/adviser/notifications" },
  { label: "My Account", to: "/my-account" },
];

const ResearchAdviserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  // Function to be passed to the sidebar to close itself
  const handleCloseSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setSidebarOpen(false);
  };

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Navbar
        // MODIFIED: Only need to toggle the sidebar on hamburger click
        onHamburgerClick={() => setSidebarOpen(true)}
        // REMOVED: isHamburgerOpen prop is no longer needed in Navbar for icon switch
      />

      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <ResearchAdviserSideNavbar />
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        {children}
      </main>

      {/* Mobile Sidebar & Overlay */}
      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={handleCloseSidebar}></div>
      )}
      <aside className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* NEW: Close button at the top right of the sidebar */}
        <button className="mobile-sidebar-close-btn" onClick={handleCloseSidebar}>
            &#10005;
        </button>

        {adviserLinks.map((link) => (
          <button
            key={link.label}
            className={`mobile-sidebar-link${location.pathname === link.to ? " active" : ""}`}
            onClick={() => handleNav(link.to)}
          >
            {link.label}
          </button>
        ))}
        <button className="mobile-sidebar-link" onClick={handleLogout}>
          Logout
        </button>
      </aside>
    </div>
  );
};

export default ResearchAdviserLayout;