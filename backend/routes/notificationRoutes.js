const express = require("express");
const router = express.Router();
const { Notification, Project, User } = require("../models");

const { getResearchCoordinatorNotifications, markNotificationRead, getStudentNotifications, markStudentNotificationRead } = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const { isEligibleResearchStudent } = require("../utils/studentEligibility");

function getTimelineEventType(reason = "") {
  const text = reason.toLowerCase();

  if (text.includes("informed the student") || text.includes("please reupload your updated document")) {
    return "informed_student";
  }
  if (text.includes("reuploaded")) return "reuploaded";
  if (
    text.includes("requires revision") ||
    text.includes("marked for revision") ||
    text.includes("requested revision")
  ) return "revision_request";
  if (text.includes("endorsed")) return "endorsed";
  if (text.includes("approved") || text.includes("repository")) return "approved";
  if (text.includes("submitted") || text.includes("pending")) return "pending";

  return "activity";
}

function getNotificationOwnerRole(notification) {
  if (notification.adviserId) return "research_adviser";
  if (notification.studentId) return "student";
  if (notification.researchCoordinatorId) return "research_coordinator";

  return null;
}

function getLegacyRevisionActorRole(reason = "") {
  const text = reason.toLowerCase();

  // Legacy notifications do not have a source/actor column yet. This limited
  // fallback only disambiguates who initiated a revision workflow.
  if (text.includes("from research coordinator") || text.includes("requested revision")) {
    return "research_coordinator";
  }

  return "research_adviser";
}

function getTimelineActorRole(notification, eventType, project, reason = "") {
  const ownerRole = getNotificationOwnerRole(notification);

  switch (eventType) {
    case "pending":
    case "reuploaded":
      return "student";
    case "endorsed":
    case "informed_student":
      return "research_adviser";
    case "revision_request":
      if (ownerRole === "research_coordinator" || ownerRole === "admin") return ownerRole;
      return getLegacyRevisionActorRole(reason);
    case "approved":
      if (["research_coordinator", "admin"].includes(project?.last_updated_by_role)) {
        return project.last_updated_by_role;
      }
      if (ownerRole === "research_coordinator" || ownerRole === "admin") return ownerRole;
      return "admin";
    default:
      return ownerRole;
  }
}

router.get("/adviser/:id", authMiddleware(["research_adviser"]), async (req, res) => {
  const notifications = await Notification.findAll({
    where: { adviserId: req.params.id },
    order: [["createdAt", "DESC"]],
  });
  res.json({ notifications });
});

router.get(
  "/project/:projectId/timeline",
  authMiddleware(["student", "admin", "research_coordinator", "research_adviser"]),
  async (req, res) => {
    try {
      if (req.user.role === "student" && !isEligibleResearchStudent(req.user)) {
        return res.status(403).json({
          message: "Timeline is only available to eligible research students.",
        });
      }

      const project = await Project.findByPk(req.params.projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      if (req.user.role === "student" && project.submitted_by !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const notifications = await Notification.findAll({
        where: { projectId: req.params.projectId },
        order: [["createdAt", "ASC"]],
      });

      const timeline = notifications.map((notification) => {
        const item = notification.toJSON();
        const reason = item.reason || "";
        const eventType = getTimelineEventType(reason);

        return {
          id: item.id,
          projectId: item.projectId,
          eventType,
          actorRole: getTimelineActorRole(item, eventType, project, reason),
          recipientRole: getNotificationOwnerRole(item),
          adviserId: item.adviserId,
          studentId: item.studentId,
          researchCoordinatorId: item.researchCoordinatorId,
          message: reason,
          timestamp: item.createdAt,
        };
      });

      res.json({
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          rejection_reason: project.rejection_reason,
          last_updated_by_role: project.last_updated_by_role,
        },
        timeline,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project timeline", error: error.message });
    }
  }
);

router.patch("/adviser/:id/read", authMiddleware(["research_adviser"]), async (req, res) => {
  const notif = await Notification.findOne({
    where: { id: req.params.id, adviserId: req.user.id }
  });
  if (!notif) return res.status(404).json({ message: "Notification not found" });
  notif.isRead = true;
  await notif.save();
  res.json({ message: "Notification marked as read" });
});
router.get("/research-coordinator/:id", authMiddleware(["research_coordinator"]), getResearchCoordinatorNotifications);
router.patch("/research-coordinator/:id/read", authMiddleware(["research_coordinator"]), markNotificationRead);

// router.get("/admin/notifications", authMiddleware(["admin"]), getAdminNotifications);
// router.patch("/admin/notifications/:id/read", authMiddleware(["admin"]), markNotificationRead);

router.get("/student", authMiddleware(["student"]), getStudentNotifications);
router.patch("/student/mark-all-read", authMiddleware(["student"]), async (req, res) => {
  if (!isEligibleResearchStudent(req.user)) {
    return res.status(403).json({
      message: "Notifications are only available to eligible research students.",
    });
  }

  await Notification.update({ isRead: true }, { where: { studentId: req.user.id, isRead: false } });
  res.json({ message: "All notifications marked as read" });
});
router.patch("/student/:id/read", authMiddleware(["student"]), markStudentNotificationRead);

module.exports = router;
