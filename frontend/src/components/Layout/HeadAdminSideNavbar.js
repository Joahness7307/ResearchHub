import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AdminSideNavbar.css";

const HeadAdminSideNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const path = location.pathname;

  return (
    <aside className="side-navbar">
      <div className="side-nav-links">
        <button
          className={`side-nav-link${path === "/head-admin" ? " active" : ""}`}
          onClick={() => navigate("/head-admin")}
        >
          Dashboard
        </button>
        <button
          className={`side-nav-link${path === "/head-admin/pending-projects" ? " active" : ""}`}
          onClick={() => navigate("/head-admin/pending-projects")}
        >
          Pending Projects
        </button>
        <button
          className={`side-nav-link${path === "/head-admin/approved-projects" ? " active" : ""}`}
          onClick={() => navigate("/head-admin/approved-projects")}
        >
          Approved Projects
        </button>
        <button
          className={`side-nav-link${path === "/head-admin/request-for-revision" ? " active" : ""}`}
          onClick={() => navigate("/head-admin/request-for-revision")}
        >
          Request for Revision
        </button>
        <button
          className={`side-nav-link${path === "/head-admin/repository" ? " active" : ""}`}
          onClick={() => navigate("/head-admin/repository")}
        >
          Project Repository
        </button>
        <button
          className={`side-nav-link${path === "/head-admin/notifications" ? " active" : ""}`}
          onClick={() => navigate("/head-admin/notifications")}
        >
          Notifications
        </button>
      </div>
      <button className="side-nav-link logout-link" onClick={() => {
        logout();
        navigate("/login");
      }}>
        Logout
      </button>
    </aside>
  );
};

export default HeadAdminSideNavbar;