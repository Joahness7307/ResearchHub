/** Custom events for cross-component workflow sync (no route change required). */

export const WORKFLOW_PROJECTS_UPDATED = "workflow-projects-updated";
export const WORKFLOW_NOTIFICATIONS_UPDATED = "workflow-notifications-updated";

export function dispatchWorkflowProjectsUpdated(detail = {}) {
  window.dispatchEvent(
    new CustomEvent(WORKFLOW_PROJECTS_UPDATED, { detail })
  );
}

export function dispatchWorkflowNotificationsUpdated(detail = {}) {
  window.dispatchEvent(
    new CustomEvent(WORKFLOW_NOTIFICATIONS_UPDATED, { detail })
  );
}

export function dispatchWorkflowRefresh(detail = {}) {
  dispatchWorkflowProjectsUpdated(detail);
  dispatchWorkflowNotificationsUpdated(detail);
}
