import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import "./AdminSideNavbar.css"; // Reuse styles

const ResearchAdviserSideNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const path = location.pathname;

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch notifications for adviser and count unread
        axios.get(`/notifications/adviser/${localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : ""}`)
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
                    className={`side-nav-link${path === "/adviser" ? " active" : ""}`}
                    onClick={() => navigate("/adviser")}
                >
                    Dashboard
                </button>
                <button
                    className={`side-nav-link${path === "/adviser/pending-projects" ? " active" : ""}`}
                    onClick={() => navigate("/adviser/pending-projects")}
                >
                    Pending Projects
                </button>
                <button
                    className={`side-nav-link${path === "/adviser/endorsed-projects" ? " active" : ""}`}
                    onClick={() => navigate("/adviser/endorsed-projects")}
                >
                    Endorsed Projects
                </button>
                <button
                    className={`side-nav-link${path === "/adviser/approved-projects" ? " active" : ""}`}
                    onClick={() => navigate("/adviser/approved-projects")}
                >
                    Approved Projects
                </button>
                <button
                    className={`side-nav-link${path === "/adviser/request-for-revision" ? " active" : ""}`}
                    onClick={() => navigate("/adviser/request-for-revision")}
                >
                    Request for Revision
                </button>
                <button
                    className={`side-nav-link${path === "/adviser/repository" ? " active" : ""}`}
                    onClick={() => navigate("/adviser/repository")}
                >
                    Project Repository
                </button>
                <button
                    className={`side-nav-link${path === "/adviser/notifications" ? " active" : ""}`}
                    onClick={() => navigate("/adviser/notifications")}
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
            <button
                className="side-nav-link logout-link"
                onClick={() => {
                    logout();
                    navigate("/login");
                }}
            >
                Logout
            </button>
        </aside>
    );
};

export default ResearchAdviserSideNavbar;