import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "../api/axios";
import { API_ROUTES } from "../api/apiRoutes";

/** Normalize Sequelize / snake_case payloads */
export function notificationIsUnread(n) {
  if (n == null || typeof n !== "object") return false;
  if (typeof n.isRead === "boolean") return !n.isRead;
  if (typeof n.is_read === "boolean") return !n.is_read;
  return false;
}

const PATH_BY_ROLE = {
  head_admin: "/head-admin/notifications",
  research_adviser: "/adviser/notifications",
};

const DashboardNotificationsUnreadContext = createContext(null);

/**
 * Provides a single unread count for adviser/head-admin notification routes,
 * fetched once per layout (desktop sidebar + mobile drawer share this).
 */
export function DashboardNotificationsUnreadProvider({ role, children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const notificationsPath = PATH_BY_ROLE[role] ?? "";

  const refreshUnreadCount = useCallback(() => {
    setRefreshNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!user?.id || (role !== "head_admin" && role !== "research_adviser")) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res =
          role === "head_admin"
            ? await axios.get(
                API_ROUTES.notifications.headAdminById(user.id)
              )
            : await axios.get(
                API_ROUTES.notifications.adviserById(user.id)
              );
        const list = res.data?.notifications ?? [];
        if (!cancelled) {
          setUnreadCount(list.filter(notificationIsUnread).length);
        }
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, role, location.pathname, refreshNonce]);

  const value = useMemo(
    () => ({
      unreadCount,
      notificationsPath,
      refreshUnreadCount,
    }),
    [unreadCount, notificationsPath, refreshUnreadCount]
  );

  return (
    <DashboardNotificationsUnreadContext.Provider value={value}>
      {children}
    </DashboardNotificationsUnreadContext.Provider>
  );
}

/**
 * Outside a provider returns zeros (e.g. admin layout).
 */
export function useDashboardNotificationsUnread() {
  const ctx = useContext(DashboardNotificationsUnreadContext);
  return (
    ctx ?? {
      unreadCount: 0,
      notificationsPath: "",
      refreshUnreadCount: () => {},
    }
  );
}
