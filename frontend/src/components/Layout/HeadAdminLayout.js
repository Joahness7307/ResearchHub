import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import HeadAdminSideNavbar from "./HeadAdminSideNavbar";
import Navbar from "./Navbar";
import "./DashboardLayout.css"; // <-- Use the new shared CSS

const headAdminLinks = [
    { label: "Dashboard", to: "/head-admin" },
    { label: "Pending Projects", to: "/head-admin/pending-projects" },
    { label: "Approved Projects", to: "/head-admin/approved-projects" },
    { label: "Request for Revision", to: "/head-admin/request-for-revision" },
    { label: "Project Repository", to: "/head-admin/repository" },
    { label: "Notifications", to: "/head-admin/notifications" },
    { label: "My Account", to: "/my-account" },
];

const HeadAdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);

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
                onHamburgerClick={() => setSidebarOpen(!sidebarOpen)}
                isHamburgerOpen={sidebarOpen}
            />

            {/* Desktop Sidebar */}
            <div className="desktop-sidebar">
                <HeadAdminSideNavbar />
            </div>

            {/* Main Content */}
            <main className="dashboard-content">
                {children}
            </main>

            {/* Mobile Sidebar & Overlay */}
            {sidebarOpen && (
                <div className="mobile-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
            )}
            <aside className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
                {headAdminLinks.map((link) => (
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

export default HeadAdminLayout;