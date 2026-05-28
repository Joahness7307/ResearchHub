function getNotificationOwnerRole(notification) {
  if (notification.studentId) return "student";
  if (notification.researchAdviserId) return "research_adviser";
  if (notification.researchCoordinatorId) return "research_coordinator";

  return null;
}

function getTimelineActorRole(notification, project) {
  const eventType = notification.event_type || getTimelineEventType(notification.reason);

  if (eventType === "submitted") {
    return "student";
  }

  if (eventType === "reuploaded") {
    return "student";
  }

  if (eventType === "endorsed") {
    return "research_adviser";
  }

  if (eventType === "approved") {
    return project.last_updated_by_role || "research_coordinator";
  }

  if (eventType === "revision_request") {
    return project.last_updated_by_role || getNotificationOwnerRole(notification);
  }

  if (eventType === "informed_student") {
    return "research_adviser";
  }

  return getNotificationOwnerRole(notification);
}

function getTimelineEventType(reason = "") {
  const text = reason.toLowerCase();

  if (text.includes("submitted")) return "submitted";
  if (text.includes("endorsed")) return "endorsed";
  if (text.includes("approved")) return "approved";
  if (text.includes("revision")) return "revision_request";
  if (text.includes("reuploaded")) return "reuploaded";
  if (text.includes("informed") || text.includes("please reupload")) return "informed_student";

  return "workflow_update";
}

module.exports = {
  getNotificationOwnerRole,
  getTimelineActorRole,
  getTimelineEventType,
};
