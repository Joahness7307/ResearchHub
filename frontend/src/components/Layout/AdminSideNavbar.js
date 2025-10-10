import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AdminSideNavbar.css";

const AdminSideNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const path = location.pathname;
  return (
    <aside className="side-navbar">
      <div className="side-nav-links">
        <button
          className={`side-nav-link${path === "/admin" ? " active" : ""}`}
          onClick={() => navigate("/admin")}
        >
          Dashboard
        </button>
        <button
          className={`side-nav-link${path === "/admin/notifications" ? " active" : ""}`}
          onClick={() => navigate("/admin/notifications")}
        >
          Notifications
        </button>
        <button
          className={`side-nav-link${path === "/admin/manage-users" ? " active" : ""}`}
          onClick={() => navigate("/admin/manage-users")}
        >
          Manage Users
        </button>
      </div>
      <button className="side-nav-link logout-link" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

export default AdminSideNavbar;