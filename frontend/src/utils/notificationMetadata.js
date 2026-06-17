import { NOTIFICATION_EVENT } from "../constants/notificationEvents";

export const NOTIFICATION_META = {
  [NOTIFICATION_EVENT.SUBMITTED]: {
    type: NOTIFICATION_EVENT.SUBMITTED,
    label: "Pending",
    icon: "/workflow-timeline-icons/pending-icon.png",
    badge: "pending",
    color: "pending",
    className: "pending",
  },
  [NOTIFICATION_EVENT.ENDORSED]: {
    type: NOTIFICATION_EVENT.ENDORSED,
    label: "Endorsed",
    icon: "/workflow-timeline-icons/endorsed-icon.png",
    badge: "endorsed",
    color: "endorsed",
    className: "endorsed",
  },
  [NOTIFICATION_EVENT.REVISION_REQUEST]: {
    type: NOTIFICATION_EVENT.REVISION_REQUEST,
    label: "Revision Request",
    icon: "/workflow-timeline-icons/request-revision-icon.png",
    badge: "revision",
    color: "revision",
    className: "revision",
  },
  [NOTIFICATION_EVENT.INFORMED_STUDENT]: {
    type: NOTIFICATION_EVENT.INFORMED_STUDENT,
    label: "Informed Student",
    icon: "/workflow-timeline-icons/informed-student-icon.png",
    badge: "informed",
    color: "informed",
    className: "informed",
  },
  [NOTIFICATION_EVENT.REUPLOADED]: {
    type: NOTIFICATION_EVENT.REUPLOADED,
    label: "Reuploaded",
    icon: "/workflow-timeline-icons/reuploaded-icon.png",
    badge: "reuploaded",
    color: "reuploaded",
    className: "reuploaded",
  },
  [NOTIFICATION_EVENT.APPROVED]: {
    type: NOTIFICATION_EVENT.APPROVED,
    label: "Approved",
    icon: "/workflow-timeline-icons/approved-icon.png",
    badge: "approved",
    color: "approved",
    className: "approved",
  },
  [NOTIFICATION_EVENT.WORKFLOW_UPDATE]: {
    type: NOTIFICATION_EVENT.WORKFLOW_UPDATE,
    label: "Activity",
    icon: "/workflow-timeline-icons/pending-icon.png",
    badge: "activity",
    color: "activity",
    className: "activity",
  },
};

function getEventType(notification = {}) {
  return notification.event_type || notification.eventType || NOTIFICATION_EVENT.WORKFLOW_UPDATE;
}

export function formatNotificationSummary(message = "") {
  if (!message) return "New notification";

  let summary = message;

  const reasonIndex = summary.indexOf(" Reason:");
  if (reasonIndex !== -1) {
    summary = summary.slice(0, reasonIndex);
  }

  const coordinatorReasonIndex = summary.indexOf(" Reason from Research Coordinator:");
  if (coordinatorReasonIndex !== -1) {
    summary = summary.slice(0, coordinatorReasonIndex);
  }

  const reuploadIndex = summary.indexOf(". Please reupload");
  if (reuploadIndex !== -1) {
    summary = summary.slice(0, reuploadIndex);
  }

  summary = summary.replace(/[.,\s]+$/, "");

  if (summary.length > 90) {
    summary = `${summary.slice(0, 90).replace(/\s+\S*$/, "")}...`;
  }

  return summary.trim();
}

export function formatNotificationDetails(message = "") {
  if (!message) {
    return {
      summary: "No notification message.",
      revisionReason: "",
    };
  }

  const standardReasonIndex = message.indexOf(" Reason:");
  if (standardReasonIndex !== -1) {
    return {
      summary: message.slice(0, standardReasonIndex).trim(),
      revisionReason: message.slice(standardReasonIndex + " Reason:".length).trim(),
    };
  }

  const researchCoordinatorReasonIndex = message.indexOf(" Reason from Research Coordinator:");
  if (researchCoordinatorReasonIndex !== -1) {
    return {
      summary: message.slice(0, researchCoordinatorReasonIndex).trim(),
      revisionReason: message
        .slice(researchCoordinatorReasonIndex + " Reason from Research Coordinator:".length)
        .trim(),
    };
  }

  const reuploadIndex = message.indexOf(". Please reupload");
  if (reuploadIndex !== -1) {
    return {
      summary: message.slice(0, reuploadIndex).trim(),
      revisionReason: "",
    };
  }

  return {
    summary: message,
    revisionReason: "",
  };
}

export function getNotificationMetadata(notification = {}) {
  const type = getEventType(notification);
  const meta = NOTIFICATION_META[type] || NOTIFICATION_META[NOTIFICATION_EVENT.WORKFLOW_UPDATE];
  const message = notification.message || notification.reason || "";

  return {
    ...meta,
    type,
    summary: formatNotificationSummary(message),
    details: formatNotificationDetails(message),
  };
}
