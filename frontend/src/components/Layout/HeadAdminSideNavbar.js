import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import "./AdminSideNavbar.css";

const HeadAdminSideNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const path = location.pathname;

  const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch notifications for head admin and count unread
        axios.get(`/notifications/head-admin/${localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : ""}`)
            .then(res => {
                const unread = res.data.notifications.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            })
            .catch(() => setUnreadCount(0));
    }, [path, unreadCount]); // Update count when path or unreadCount changes

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
          style={{ position: "relative" }}
        >
          Notifications
          {unreadCount > 0 && (
            <span
                style={{
                    position: "absolute",
                    top: 10,
                    right: 18,
                    background: "#e53e3e",
                    color: "#fff",
                    borderRadius: "50%",
                    padding: "2px 8px",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginLeft: 8
                }}
            >
                {unreadCount}
            </span>
          )}
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