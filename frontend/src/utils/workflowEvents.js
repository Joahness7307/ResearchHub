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

let pendingWorkflowRefresh = null;

export function scheduleWorkflowRefresh(detail = {}) {
  if (pendingWorkflowRefresh) {
    pendingWorkflowRefresh.detail = {
      ...pendingWorkflowRefresh.detail,
      ...detail,
    };
    return;
  }

  pendingWorkflowRefresh = {
    detail,
    timer: window.setTimeout(() => {
      const nextDetail = pendingWorkflowRefresh.detail;
      pendingWorkflowRefresh = null;
      dispatchWorkflowRefresh(nextDetail);
    }, 250),
  };
}
