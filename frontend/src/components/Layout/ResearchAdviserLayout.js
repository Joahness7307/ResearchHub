import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ResearchAdviserSideNavbar from "./ResearchAdviserSideNavbar";
import "./DashboardLayout.css";
import { useSidebar } from "../../context/SidebarContext"; // added

const ResearchAdviserLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = React.useContext(AuthContext);

  const { isOpen: sidebarOpen, setOpen } = useSidebar("research_adviser");

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
      <div className="desktop-sidebar">
        <ResearchAdviserSideNavbar />
      </div>

      <main className="dashboard-content">
        {children}
      </main>

      {sidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={handleCloseSidebar}></div>
      )}

      <aside className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="mobile-sidebar-close-btn" onClick={handleCloseSidebar}>
          &#10005;
        </button>

        {[
          { label: "Dashboard", to: "/adviser" },
          { label: "Pending Projects", to: "/adviser/pending-projects" },
          { label: "Endorsed Projects", to: "/adviser/endorsed-projects" },
          { label: "Approved Projects", to: "/adviser/approved-projects" },
          { label: "Request for Revision", to: "/adviser/request-for-revision" },
          { label: "Project Repository", to: "/adviser/repository" },
          { label: "Notifications", to: "/adviser/notifications" },
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

export default ResearchAdviserLayout;