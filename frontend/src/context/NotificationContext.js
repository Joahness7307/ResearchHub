import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import axios from "../api/axios";
import { API_ROUTES } from "../api/apiRoutes";
import { isEligibleResearchStudent } from "../utils/studentEligibility";
import {
  WORKFLOW_NOTIFICATIONS_UPDATED,
  dispatchWorkflowProjectsUpdated,
} from "../utils/workflowEvents";

export function notificationIsUnread(notification) {
  if (notification == null || typeof notification !== "object") return false;
  if (typeof notification.isRead === "boolean") return !notification.isRead;
  if (typeof notification.is_read === "boolean") return !notification.is_read;
  return false;
}

const NOTIFICATION_PATH_BY_ROLE = {
  student: "/notifications",
  research_adviser: "/research-adviser/notifications",
  research_coordinator: "/research-coordinator/notifications",
  admin: "/admin/notifications",
};

function getNotificationConfig(user) {
  if (!user?.id) return null;

  if (user.role === "student") {
    if (!isEligibleResearchStudent(user)) return null;
    return {
      role: "student",
      listUrl: API_ROUTES.notifications.student,
      markReadUrl: (id) => API_ROUTES.notifications.studentMarkAsRead(id),
      markAllReadUrl: API_ROUTES.notifications.studentMarkAllAsRead,
      notificationsPath: NOTIFICATION_PATH_BY_ROLE.student,
      socketChannel: `student_notify_${user.id}`,
      workflowSocketEvents: ["workflow_refresh_student"],
      socketRoom: { role: "student", userId: user.id },
    };
  }

  if (user.role === "research_adviser") {
    return {
      role: "research_adviser",
      listUrl: API_ROUTES.notifications.researchAdviserById(user.id),
      markReadUrl: (id) => API_ROUTES.notifications.researchAdviserMarkAsRead(id),
      notificationsPath: NOTIFICATION_PATH_BY_ROLE.research_adviser,
      socketChannel: `research_adviser_notify_${user.id}`,
      workflowSocketEvents: ["workflow_refresh_research_adviser"],
      socketRoom: { role: "research_adviser", userId: user.id },
    };
  }

  if (user.role === "research_coordinator") {
    return {
      role: "research_coordinator",
      listUrl: API_ROUTES.notifications.researchCoordinatorById(user.id),
      markReadUrl: (id) => API_ROUTES.notifications.researchCoordinatorMarkAsRead(id),
      notificationsPath: NOTIFICATION_PATH_BY_ROLE.research_coordinator,
      socketChannel: `research_coordinator_notify_${user.id}`,
      workflowSocketEvents: ["workflow_refresh_research_coordinator"],
      socketRoom: { role: "research_coordinator", userId: user.id },
    };
  }

  return null;
}

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);

  const config = useMemo(() => getNotificationConfig(user), [user]);

  const unreadCount = useMemo(
    () => notifications.filter(notificationIsUnread).length,
    [notifications]
  );

  const refreshNotifications = useCallback(async () => {
    if (!config?.listUrl) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return [];
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(config.listUrl);
      const nextNotifications = res.data?.notifications ?? [];

      if (requestRef.current === requestId) {
        setNotifications(nextNotifications);
      }

      return nextNotifications;
    } catch (err) {
      if (requestRef.current === requestId) {
        setNotifications([]);
        setError(err);
      }
      return [];
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [config]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!config?.markReadUrl || !notificationId) return false;

      const numericId = Number(notificationId);
      const previousNotifications = notifications;
      const target = notifications.find((item) => Number(item.id) === numericId);

      if (!target || !notificationIsUnread(target)) return true;

      setNotifications((current) =>
        current.map((item) =>
          Number(item.id) === numericId
            ? { ...item, isRead: true, is_read: true }
            : item
        )
      );

      try {
        await axios.patch(config.markReadUrl(notificationId));
        return true;
      } catch (err) {
        setNotifications(previousNotifications);
        setError(err);
        return false;
      }
    },
    [config, notifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (!config?.markReadUrl) return false;

    const previousNotifications = notifications;
    const unreadNotifications = notifications.filter(notificationIsUnread);

    if (unreadNotifications.length === 0) return true;

    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true, is_read: true }))
    );

    try {
      if (config.markAllReadUrl) {
        await axios.patch(config.markAllReadUrl);
      } else {
        await Promise.all(
          unreadNotifications.map((item) => axios.patch(config.markReadUrl(item.id)))
        );
      }
      return true;
    } catch (err) {
      setNotifications(previousNotifications);
      setError(err);
      return false;
    }
  }, [config, notifications]);

  const getNotificationById = useCallback(
    (notificationId) =>
      notifications.find((item) => Number(item.id) === Number(notificationId)) ||
      null,
    [notifications]
  );

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const handleWorkflowNotifications = (event) => {
      const detail = event.detail ?? {};

      if (detail?.read && detail.notificationId) {
        setNotifications((current) =>
          current.map((item) =>
            Number(item.id) === Number(detail.notificationId)
              ? { ...item, isRead: true, is_read: true }
              : item
          )
        );
        return;
      }

      refreshNotifications();
    };

    window.addEventListener(
      WORKFLOW_NOTIFICATIONS_UPDATED,
      handleWorkflowNotifications
    );
    return () =>
      window.removeEventListener(
        WORKFLOW_NOTIFICATIONS_UPDATED,
        handleWorkflowNotifications
      );
  }, [refreshNotifications]);

  useEffect(() => {
    if (!config?.socketChannel || !process.env.REACT_APP_BACKEND_URL) {
      return undefined;
    }

    const socket = io(process.env.REACT_APP_BACKEND_URL);
    const handleSocketMessage = (detail = {}) => {
      if (detail?.type === "notification_read") {
        if (detail.notificationId) {
          setNotifications((current) =>
            current.map((item) =>
              Number(item.id) === Number(detail.notificationId)
                ? { ...item, isRead: true, is_read: true }
                : item
            )
          );
        } else {
          setNotifications((current) =>
            current.map((item) => ({ ...item, isRead: true, is_read: true }))
          );
        }
        return;
      }

      refreshNotifications();
      dispatchWorkflowProjectsUpdated(detail);
    };

    socket.emit("join_room", config.socketRoom);
    socket.on(config.socketChannel, handleSocketMessage);
    config.workflowSocketEvents.forEach((eventName) => {
      socket.on(eventName, handleSocketMessage);
    });

    return () => {
      socket.disconnect();
    };
  }, [config, refreshNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      notificationsPath: config?.notificationsPath ?? "",
      canUseNotifications: Boolean(config),
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      getNotificationById,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      config,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      getNotificationById,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  return (
    context ?? {
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      notificationsPath: "",
      canUseNotifications: false,
      refreshNotifications: async () => [],
      markAsRead: async () => false,
      markAllAsRead: async () => false,
      getNotificationById: () => null,
    }
  );
}
