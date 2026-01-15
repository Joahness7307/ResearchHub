import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AdminSideNavbar from "./AdminSideNavbar";
import "./DashboardLayout.css";
import { useSidebar } from "../../context/SidebarContext"; // added

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = React.useContext(AuthContext);

  // Use shared sidebar state for "admin"
  const { isOpen: sidebarOpen, setOpen } = useSidebar("admin");

  const handleCloseSidebar = () => setOpen(false);
  const handleToggleSidebar = () => setOpen(!sidebarOpen);

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
      {/* desktop sidebar */}
      <div className="desktop-sidebar">
        <AdminSideNavbar />
      </div>

      {/* main content */}
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
        {/* mobile links */}
        {[
          { label: "Dashboard", to: "/admin" },
          // { label: "Notifications", to: "/admin/notifications" },
          { label: "Manage Users", to: "/admin/manage-users" },
          { label: "Manage Projects", to: "/admin/manage-projects" },
          { label: "Academic Settings", to: "/admin/academic" },
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

export default AdminLayout;