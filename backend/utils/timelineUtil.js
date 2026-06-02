const { NOTIFICATION_EVENT } = require("../constants/notificationEvents");

function getNotificationOwnerRole(notification) {
  if (notification.studentId) return "student";
  if (notification.researchAdviserId) return "research_adviser";
  if (notification.researchCoordinatorId) return "research_coordinator";

  return null;
}

function getTimelineActorRole(notification, project) {
  const eventType = getTimelineEventType(notification);

  if (eventType === NOTIFICATION_EVENT.SUBMITTED) {
    return "student";
  }

  if (eventType === NOTIFICATION_EVENT.REUPLOADED) {
    return "student";
  }

  if (eventType === NOTIFICATION_EVENT.ENDORSED) {
    return "research_adviser";
  }

  if (eventType === NOTIFICATION_EVENT.APPROVED) {
    return project.last_updated_by_role || "research_coordinator";
  }

  if (eventType === NOTIFICATION_EVENT.REVISION_REQUEST) {
    return project.last_updated_by_role || getNotificationOwnerRole(notification);
  }

  if (eventType === NOTIFICATION_EVENT.INFORMED_STUDENT) {
    return "research_adviser";
  }

  return getNotificationOwnerRole(notification);
}

function getTimelineEventType(notification = {}) {
  return notification.event_type || notification.eventType || NOTIFICATION_EVENT.WORKFLOW_UPDATE;
}

module.exports = {
  getNotificationOwnerRole,
  getTimelineActorRole,
  getTimelineEventType,
};
