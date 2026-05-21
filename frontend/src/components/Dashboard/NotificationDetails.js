import React, { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useDashboardNotificationsUnread } from "../../context/DashboardNotificationsUnreadContext";
import { isEligibleResearchStudent } from "../../utils/studentEligibility";
import ProjectTimeline from "../Workflow/ProjectTimeline";
import "./NotificationPage.css";

function getNotificationType(reason = "") {
  const text = reason.toLowerCase();

  if (text.includes("informed the student") || text.includes("please reupload your updated document")) {
    return "informed";
  }
  if (text.includes("reuploaded")) return "reuploaded";
  if (
    text.includes("requires revision") ||
    text.includes("marked for revision") ||
    text.includes("requested revision")
  ) return "revision";
  if (text.includes("endorsed")) return "endorsed";
  if (text.includes("approved") || text.includes("repository")) return "approved";
  if (text.includes("submitted") || text.includes("pending")) return "pending";

  return "activity";
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNotificationDetails(reason = "") {
  if (!reason) {
    return {
      summary: "No notification message.",
      revisionReason: "",
    };
  }

  // Split by "Reason:"
  const reasonMatch = reason.split(" Reason:");

  // If no revision reason exists
  if (reasonMatch.length === 1) {
    return {
      summary: reason,
      revisionReason: "",
    };
  }

  return {
    summary: reasonMatch[0].trim(),
    revisionReason: reasonMatch[1].trim(),
  };
}

// ── Reusable action buttons component ──
// Defined once here, used twice in the JSX below
const ActionButtons = ({ projectId, user, navigate }) => {

  const handleViewProject = () => {
    if (user.role === "research_adviser") {
      navigate(`/adviser/projects/${projectId}`);
    } else if (user.role === "head_admin") {
      navigate(`/head-admin/projects/${projectId}`);
    } else if (user.role === "admin") {
      navigate(`/admin/projects/${projectId}`);
    } else {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleBack = () => {
    if (user.role === "student") {
      navigate("/notifications");
    } else if (user.role === "research_adviser") {
      navigate("/adviser/notifications");
    } else if (user.role === "admin") {
      navigate("/admin/notifications");
    } else if (user.role === "head_admin") {
      navigate("/head-admin/notifications");
    }
  };

  return (
    <div className="notification-details-actions">
      <button
        className="notification-secondary-action"
        onClick={handleBack}
      >
        Back
      </button>
      {projectId && (
        <button
          className="notification-primary-action"
          onClick={handleViewProject}
        >
          View Current Project
        </button>
      )}
    </div>
  );
};

const NotificationDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [notification, setNotification] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [projectContext, setProjectContext] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const navigate = useNavigate();
  const { refreshUnreadCount } = useDashboardNotificationsUnread();

  useEffect(() => {
    if (!id || !user) return;
    if (user.role === "student" && !isEligibleResearchStudent(user)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    let notifUrl = "";
    if (isEligibleResearchStudent(user)) {
      notifUrl = API_ROUTES.notifications.student;
    } else if (user.role === "research_adviser") {
      notifUrl = API_ROUTES.notifications.adviserById(user.id);
    } else if (user.role === "head_admin") {
      notifUrl = API_ROUTES.notifications.headAdminById(user.id);
    } else if (user.role === "admin") {
      notifUrl = API_ROUTES.notifications.adminById(user.id);
    }

    if (!notifUrl) return;

    axios.get(notifUrl)
      .then(res => {
        const notif = res.data.notifications.find(n => n.id === parseInt(id));
        setNotification(notif);
        if (notif && notif.projectId) setProjectId(notif.projectId);
        // Mark as read if not already
        if (notif && !notif.isRead) {
          let patchUrl = "";
          if (isEligibleResearchStudent(user)) {
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
  }, [id, user, navigate, refreshUnreadCount]);

  useEffect(() => {
    if (!projectId) return;

    axios
      .get(API_ROUTES.notifications.projectTimeline(projectId))
      .then((res) => {
        setProjectContext(res.data?.project || null);
        setTimeline(res.data?.timeline || []);
      })
      .catch(() => {
        setProjectContext(null);
        setTimeline([]);
      });
  }, [projectId]);

  if (!notification) return <div style={{ margin: "120px auto", textAlign: "center" }}>Loading notification...</div>;

  const notificationType = getNotificationType(notification.reason || "");
  const currentStatus = projectContext?.status || notification.Project?.status;
  const revisionReason = projectContext?.rejection_reason;
  const formattedNotification = formatNotificationDetails(notification.reason || "");

  return (
    <div className="notification-details-container">
      <div className="notification-details-header">
        <div>
          <h2 className="notification-title">Notification Details</h2>
          <span className={`notification-context-badge ${notificationType}`}>
            {formatStatus(notificationType)}
          </span>
        </div>
      </div>

      <section className="notification-context-card">
        <h3>Original Notification</h3>

        <p className="notification-context-message">
          {formattedNotification.summary}
        </p>

        {formattedNotification.revisionReason && (
          <div className="notification-reason-box">
            <p className="notification-reason-label">Reason:</p>

            <p className="notification-reason-text">
              {formattedNotification.revisionReason}
            </p>
          </div>
        )}

        <div className="notification-context-meta">
          <span>
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : ""}
          </span>
        </div>
      </section>

      <section className="notification-context-grid">
        <div className="notification-context-card">
          <h3>Current Project Status</h3>
          <p className="notification-context-value">{formatStatus(currentStatus)}</p>
          <span className="notification-context-help">
            This reflects the project state today, not necessarily the state when this notification was created.
          </span>
        </div>
        <div className="notification-context-card">
          <h3>Revision Reason</h3>
          <p className="notification-context-value">
            {revisionReason || "No active revision reason on the current project."}
          </p>
        </div>
      </section>

      <ActionButtons projectId={projectId} user={user} navigate={navigate} />

      <ProjectTimeline events={timeline} activeNotificationId={id} />

      <ActionButtons projectId={projectId} user={user} navigate={navigate} />

    </div>
  );
};

export default NotificationDetails;
