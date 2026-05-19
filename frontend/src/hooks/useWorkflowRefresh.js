import { useEffect } from "react";
import { io } from "socket.io-client";
import {
  WORKFLOW_PROJECTS_UPDATED,
  WORKFLOW_NOTIFICATIONS_UPDATED,
  dispatchWorkflowRefresh,
} from "../utils/workflowEvents";

/**
 * Subscribes to workflow custom events and optional role socket channels.
 * @param {object} options
 * @param {() => void} options.onProjectsRefresh
 * @param {() => void} [options.onNotificationsRefresh]
 * @param {string} [options.socketChannel] e.g. adviser_notify_12
 * @param {string[]} [options.workflowSocketEvents] e.g. ['workflow_refresh_adviser']
 */
export function useWorkflowRefresh({
  onProjectsRefresh,
  onNotificationsRefresh,
  socketChannel,
  workflowSocketEvents = [],
}) {
  useEffect(() => {
    if (!onProjectsRefresh) return undefined;

    const handleProjects = () => onProjectsRefresh();
    const handleNotifications = () => {
      if (onNotificationsRefresh) onNotificationsRefresh();
    };

    window.addEventListener(WORKFLOW_PROJECTS_UPDATED, handleProjects);
    window.addEventListener(WORKFLOW_NOTIFICATIONS_UPDATED, handleNotifications);

    return () => {
      window.removeEventListener(WORKFLOW_PROJECTS_UPDATED, handleProjects);
      window.removeEventListener(
        WORKFLOW_NOTIFICATIONS_UPDATED,
        handleNotifications
      );
    };
  }, [onProjectsRefresh, onNotificationsRefresh]);

  useEffect(() => {
    if (!process.env.REACT_APP_BACKEND_URL) return undefined;
    const hasChannels =
      socketChannel || (workflowSocketEvents && workflowSocketEvents.length > 0);
    if (!hasChannels) return undefined;

    const socket = io(process.env.REACT_APP_BACKEND_URL);

    const onSocketMessage = () => dispatchWorkflowRefresh();

    if (socketChannel) {
      socket.on(socketChannel, onSocketMessage);
    }
    workflowSocketEvents.forEach((event) => {
      socket.on(event, onSocketMessage);
    });

    return () => {
      socket.disconnect();
    };
  }, [socketChannel, workflowSocketEvents.join("|")]);
}
