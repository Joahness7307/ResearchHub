import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import HeadAdminSideNavbar from "./HeadAdminSideNavbar";
import "./DashboardLayout.css";
import { useSidebar } from "../../context/SidebarContext"; // added

const HeadAdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = React.useContext(AuthContext);

  const { isOpen: sidebarOpen, setOpen } = useSidebar("head_admin");

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
      <div className="desktop-sidebar">
        <HeadAdminSideNavbar />
      </div>

      <main className="dashboard-content">
        {children}
      </main>

      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setOpen(false)}></div>
      )}

      <aside className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="mobile-sidebar-close-btn" onClick={() => setOpen(false)}>
          &#10005;
        </button>
        {[
          { label: "Dashboard", to: "/head-admin" },
          { label: "Pending Projects", to: "/head-admin/pending-projects" },
          { label: "Approved Projects", to: "/head-admin/approved-projects" },
          { label: "Request for Revision", to: "/head-admin/request-for-revision" },
          { label: "Project Repository", to: "/head-admin/repository" },
          { label: "Notifications", to: "/head-admin/notifications" },
          { label: "My Account", to: "/my-account" },
        ].map(link => (
          <button key={link.label} className={`mobile-sidebar-link${location.pathname === link.to ? " active" : ""}`} onClick={() => handleNav(link.to)}>
            {link.label}
          </button>
        ))}
        <button className="mobile-sidebar-link" onClick={handleLogout}>Logout</button>
      </aside>
    </div>
  );
};

export default HeadAdminLayout;