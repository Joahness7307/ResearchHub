import React from "react";
import {
  notificationIsUnread,
  useNotifications,
} from "./NotificationContext";

export { notificationIsUnread };

/**
 * Compatibility wrapper for existing dashboard layouts.
 * NotificationProvider is now the single owner of notification state.
 */
export function DashboardNotificationsUnreadProvider({ children }) {
  return <>{children}</>;
}

export function useDashboardNotificationsUnread() {
  const { unreadCount, notificationsPath, refreshNotifications } =
    useNotifications();

  return {
    unreadCount,
    notificationsPath,
    refreshUnreadCount: refreshNotifications,
  };
}
