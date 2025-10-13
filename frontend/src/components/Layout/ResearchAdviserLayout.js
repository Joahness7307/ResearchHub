// ResearchAdviserLayout.js
import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ResearchAdviserSideNavbar from "./ResearchAdviserSideNavbar";
import Navbar from "./Navbar";
import "./DashboardLayout.css";

const adviserLinks = [
    { label: "Dashboard", to: "/adviser" },
    { label: "Pending Projects", to: "/adviser/pending-projects" },
    { label: "Endorsed Projects", to: "/adviser/endorsed-projects" }, // FIXED: Correct path
    { label: "Approved Projects", to: "/adviser/approved-projects" }, // Correct path
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

    // Function to be passed to the sidebar to close itself (also used by overlay/close btn)
    const handleCloseSidebar = () => setSidebarOpen(false);

    // --- FIX: Toggle function for Navbar ---
    const handleToggleSidebar = () => setSidebarOpen(prev => !prev);

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
                // CORRECTED: Pass the toggle function and the current state
                onHamburgerClick={handleToggleSidebar}
                isHamburgerOpen={sidebarOpen}
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