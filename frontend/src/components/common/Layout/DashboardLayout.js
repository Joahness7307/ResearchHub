// Reusable layout component for all dashboard roles.
// Consolidates duplicated logic from AdminLayout, ResearchCoordinatorLayout, and ResearchAdviserLayout.
// Supports React Router v6 (useNavigate, useLocation) and prepares for Outlet in nested routes.

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useDashboardNotificationsUnread } from "../../../context/DashboardNotificationsUnreadContext";
import "../../Layout/DashboardLayout.css"; // Assumes existing CSS; no changes needed

const DashboardLayout = ({
  role, // Role string for SidebarContext (e.g., "admin")
  sidebarComponent: SidebarComponent, // Desktop sidebar React component (e.g., AdminSideNavbar)
  mobileLinks, // Array of mobile navigation links (e.g., [{ label, to }, ...])
  children, // Main content (dashboards, etc.); can be replaced with <Outlet> in future nested routing
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = React.useContext(AuthContext);
  const { unreadCount, notificationsPath } = useDashboardNotificationsUnread();

  // Sidebar state from context
  const { isOpen: sidebarOpen, setOpen } = useSidebar(role);

  const handleCloseSidebar = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar: Renders the passed sidebar component */}
      <div className="desktop-sidebar">
        <SidebarComponent />
      </div>

      {/* Main Content Area: Renders children (e.g., dashboards) */}
      <main className="dashboard-content">
        {children}
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={handleCloseSidebar}></div>
      )}

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="mobile-sidebar-close-btn" onClick={handleCloseSidebar}>
          &#10005;
        </button>
        {/* Render mobile links with active highlighting */}
        {mobileLinks.map((link) => (
          <button
            key={link.label}
            type="button"
            className={`mobile-sidebar-link${
              location.pathname === link.to ? " active" : ""
            }`}
            onClick={() => handleNav(link.to)}
          >
            <span className="mobile-sidebar-link-text">{link.label}</span>
            {notificationsPath &&
              link.to === notificationsPath &&
              unreadCount > 0 && (
                <span
                  className="mobile-sidebar-unread-badge"
                  aria-label={`${unreadCount} unread`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
          </button>
        ))}
        {/* Logout Button */}
        <button className="mobile-sidebar-link" onClick={handleLogout}>
          Logout
        </button>
      </aside>
    </div>
  );
};

export default DashboardLayout;