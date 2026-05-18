import React, { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useDashboardNotificationsUnread } from "../../context/DashboardNotificationsUnreadContext";

const NotificationDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [notification, setNotification] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const navigate = useNavigate();
  const { refreshUnreadCount } = useDashboardNotificationsUnread();

  useEffect(() => {
    if (!id || !user) return;
    let notifUrl = "";
    if (user.role === "student") {
      notifUrl = API_ROUTES.notifications.student;
    } else if (user.role === "research_adviser") {
      notifUrl = API_ROUTES.notifications.adviserById(user.id);
    } else if (user.role === "head_admin") {
      notifUrl = API_ROUTES.notifications.headAdminById(user.id);
    } else if (user.role === "admin") {
      notifUrl = API_ROUTES.notifications.adminById(user.id);
    } else {
      notifUrl = API_ROUTES.notifications.student; // fallback for guest
    }
    axios.get(notifUrl)
      .then(res => {
        const notif = res.data.notifications.find(n => n.id === parseInt(id));
        setNotification(notif);
        if (notif && notif.projectId) setProjectId(notif.projectId);
        // Mark as read if not already
        if (notif && !notif.isRead) {
          let patchUrl = "";
          if (user.role === "student") {
            patchUrl = API_ROUTES.notifications.studentMarkAsRead(id);
          } else if (user.role === "research_adviser") {
            patchUrl = API_ROUTES.notifications.adviserMarkAsRead(id);
          } else if (user.role === "head_admin") {
            patchUrl = API_ROUTES.notifications.headAdminMarkAsRead(id);
          } else if (user.role === "admin") {
            patchUrl = API_ROUTES.notifications.adminMarkAsRead(id);
          }
          if (patchUrl) {
            axios.patch(patchUrl).then(() => {
              if (user.role === "head_admin" || user.role === "research_adviser") {
                refreshUnreadCount();
              }
            });
          }
        }
      });
  }, [id, user, refreshUnreadCount]);

  if (!notification) return <div style={{ margin: "120px auto", textAlign: "center" }}>Loading notification...</div>;

  return (
    <div style={{
      maxWidth: 500,
      margin: "120px auto 40px auto",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(37,99,235,0.07)",
      padding: "2.5rem 2rem"
    }}>
      <h2 style={{ color: "#2563eb", marginBottom: 18 }}>Notification Details</h2>
      <div style={{
        fontWeight: notification.isRead ? 400 : 700,
        color: notification.isRead ? "#888" : "#111",
        fontSize: 18,
        marginBottom: 16
      }}>
        {notification.reason}
      </div>
      <div style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ""}
      </div>
      {projectId && (
        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.7rem 1.5rem",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 24
          }}
            onClick={() => {
              if (user && user.role === "research_adviser") {
                navigate(`/adviser/projects/${projectId}`); // This is correct!
              } else if (user && user.role === "head_admin") {
                navigate(`/head-admin/projects/${projectId}`);
              } else if (user && user.role === "admin") {
                navigate(`/admin/projects/${projectId}`);
              } else {
                navigate(`/projects/${projectId}`);
              }
            }}      
            >
          VIEW PROJECT
        </button>
      )}
      <button
        style={{
          background: "#888",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "0.7rem 1.5rem",
          marginLeft: "1rem",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer"
        }}
        onClick={() => {
          if (user && user.role === "student") {
            navigate("/notifications");
          } else if (user && user.role === "research_adviser") {
            navigate("/adviser/notifications");
          } else if (user && (user.role === "admin")) {
            navigate("/admin/notifications");
          } else if (user && user.role === "head_admin") {
            navigate("/head-admin/notifications");
          }
        }}
      >
        Back
      </button>
    </div>
  );
};

export default NotificationDetails;