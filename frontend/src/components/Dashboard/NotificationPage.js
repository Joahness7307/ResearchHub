import React, { useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; 
import { useNotifications } from "../../context/NotificationContext";
import { isEligibleResearchStudent } from "../../utils/studentEligibility";
import { formatNotificationSummary } from "../../utils/formatNotificationSummary";
import "./NotificationPage.css";

const NotificationPage = () => {
  const { user } = useContext(AuthContext);
  const { notifications, loading, refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "student" && !isEligibleResearchStudent(user)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    refreshNotifications();
  }, [navigate, refreshNotifications, user]);

  return (
    <div className="notification-page-container">
      <h2 className="notification-title">Notifications</h2>
      {loading ? (
        <div className="no-notifications">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="no-notifications">No notifications yet.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map(notif => (
            <li
              key={notif.id}
              className={`notification-item${notif.isRead ? " read" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (user && user.role === "research_coordinator" ) {
                  navigate(`/research-coordinator/notifications/${notif.id}`);
                } else if (user && user.role === "admin") {
                  navigate(`/admin/notifications/${notif.id}`);
                } else if (user && user.role === "research_adviser") {
                  navigate(`/research-adviser/notifications/${notif.id}`);
                } else {
                  navigate(`/notifications/${notif.id}`);
                }
              }}
            >
              <div className="notification-message">{formatNotificationSummary(notif.message)}.</div>
              <div className="notification-meta">
                <span>
                  {notif.createdAt
                    ? new Date(notif.createdAt).toLocaleString()
                    : ""}
                </span>
                {!notif.isRead && <span className="notification-badge">New</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;
