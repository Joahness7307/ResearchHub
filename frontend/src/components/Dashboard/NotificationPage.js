import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; 
import { WORKFLOW_NOTIFICATIONS_UPDATED } from "../../utils/workflowEvents";
import { isEligibleResearchStudent } from "../../utils/studentEligibility";
import { formatNotificationSummary } from "../../utils/formatNotificationSummary";
import "./NotificationPage.css";

const NotificationPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(() => {
    if (user && user.role === "research_adviser") {
      axios.get(API_ROUTES.notifications.adviserById(user.id))
        .then(res => setNotifications(res.data.notifications))
        .catch(() => setNotifications([]));
    } else if (isEligibleResearchStudent(user)) {
      axios.get(API_ROUTES.notifications.student)
        .then(res => setNotifications(res.data.notifications))
        .catch(() => setNotifications([]));
    } else if (user && (user.role === "research_coordinator" )) {
      axios.get(API_ROUTES.notifications.researchCoordinatorById(user.id))
        .then(res => setNotifications(res.data.notifications))
        .catch(() => setNotifications([]));
    } else if (user && user.role === "admin" ) {
      axios.get(API_ROUTES.notifications.adminById(user.id))
        .then(res => setNotifications(res.data.notifications))
        .catch(() => setNotifications([]));
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "student" && !isEligibleResearchStudent(user)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    fetchNotifications();
  }, [fetchNotifications, navigate, user]);

  useEffect(() => {
    window.addEventListener(WORKFLOW_NOTIFICATIONS_UPDATED, fetchNotifications);
    return () =>
      window.removeEventListener(WORKFLOW_NOTIFICATIONS_UPDATED, fetchNotifications);
  }, [fetchNotifications]);

  return (
    <div className="notification-page-container">
      <h2 className="notification-title">Notifications</h2>
      {notifications.length === 0 ? (
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
                  navigate(`/adviser/notifications/${notif.id}`);
                } else {
                  navigate(`/notifications/${notif.id}`);
                }
              }}
            >
              <div className="notification-message">{formatNotificationSummary(notif.reason)}.</div>
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
