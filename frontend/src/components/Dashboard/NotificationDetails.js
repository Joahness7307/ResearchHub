import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { isEligibleResearchStudent } from "../../utils/studentEligibility";
import ProjectTimeline from "../Workflow/ProjectTimeline";
import { getNotificationMetadata } from "../../utils/notificationMetadata";
import "./NotificationPage.css";

function formatStatus(status) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const ActionButtons = ({ projectId, user, navigate }) => {
  const handleViewProject = () => {
    if (user.role === "research_adviser") {
      navigate(`/research-adviser/projects/${projectId}`);
    } else if (user.role === "research_coordinator") {
      navigate(`/research-coordinator/projects/${projectId}`);
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
      navigate("/research-adviser/notifications");
    } else if (user.role === "admin") {
      navigate("/admin/notifications");
    } else if (user.role === "research_coordinator") {
      navigate("/research-coordinator/notifications");
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
  const {
    getNotificationById,
    markAsRead,
    refreshNotifications,
  } = useNotifications();

  const shouldShowBottomActions = useMemo(() => timeline.length >= 5, [timeline.length]);

  useEffect(() => {
    if (!id || !user) return;
    if (user.role === "student" && !isEligibleResearchStudent(user)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    let cancelled = false;

    const loadNotification = async () => {
      let notif = getNotificationById(id);

      if (!notif) {
        const refreshed = await refreshNotifications();
        notif =
          refreshed.find((item) => Number(item.id) === Number(id)) || null;
      }

      if (cancelled) return;

      setNotification(notif);
      setProjectId(notif?.projectId ?? null);

      if (notif && (notif.isRead === false || notif.is_read === false)) {
        await markAsRead(id);
        if (!cancelled) {
          setNotification((current) =>
            current ? { ...current, isRead: true, is_read: true } : current
          );
        }
      }
    };

    loadNotification();

    return () => {
      cancelled = true;
    };
  }, [id, user, navigate, getNotificationById, markAsRead, refreshNotifications]);

  useEffect(() => {
    if (!projectId) {
      setProjectContext(null);
      setTimeline([]);
      return;
    }

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

  const notificationMetadata = getNotificationMetadata(notification);
  const currentStatus = projectContext?.status || notification.Project?.status;
  const formattedNotification = notificationMetadata.details;

  return (
    <div className="notification-details-container">
      <div className="notification-details-header">
        <div>
          <h2 className="notification-title">Notification Details</h2>
          <span className={`notification-context-badge ${notificationMetadata.badge}`}>
            {notificationMetadata.label}
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

      <section className="notification-context-card" style={{ marginTop: "1rem" }}>
          <h3>Current Project Status</h3>
          <p className="notification-context-value">{formatStatus(currentStatus)}</p>
          <span className="notification-context-help">
            This reflects the project state today, not necessarily the state when this notification was created.
          </span>
      </section>

      <ActionButtons
        projectId={projectId}
        user={user}
        navigate={navigate}
      />

      <ProjectTimeline
        events={timeline}
        activeNotificationId={id}
      />

      {shouldShowBottomActions && (
        <ActionButtons
          projectId={projectId}
          user={user}
          navigate={navigate}
        />
      )}

    </div>
  );
};

export default NotificationDetails;
