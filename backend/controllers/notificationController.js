const { Notification, Project } = require("../models");
const { isEligibleResearchStudent } = require("../utils/studentEligibility");
const {
  getTimelineActorRole,
  getNotificationOwnerRole,
  getTimelineEventType,
} = require("../utils/timelineUtil");

function emitNotificationRead(req, role, userId, notificationId) {
  const io = req.app.get("io");
  if (!io || !role || !userId) return;

  io.to(`${role}:${userId}`).emit(`${role}_notify_${userId}`, {
    type: "notification_read",
    notificationId,
    read: true,
  });
}

function timelineEventIsVisibleToUser(event, user) {
  if (user.role === "student") {
    return event.recipientRole === "student" && Number(event.studentId) === Number(user.id);
  }

  if (user.role === "research_adviser") {
    return (
      event.recipientRole === "research_adviser" &&
      Number(event.researchAdviserId) === Number(user.id)
    );
  }

  if (user.role === "research_coordinator") {
    return (
      event.recipientRole === "research_coordinator" &&
      Number(event.researchCoordinatorId) === Number(user.id)
    );
  }

  return user.role === "admin";
}

exports.getResearchCoordinatorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        researchCoordinatorId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markResearchCoordinatorNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, researchCoordinatorId: req.user.id }
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.isRead = true;
    await notif.save();
    emitNotificationRead(req, "research_coordinator", req.user.id, notif.id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResearchAdviserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        researchAdviserId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markResearchAdviserNotificationRead = async (req, res) => {
  const notif = await Notification.findOne({
    where: { id: req.params.id, researchAdviserId: req.user.id }
  });
  if (!notif) return res.status(404).json({ message: "Notification not found" });
  notif.isRead = true;
  await notif.save();
  emitNotificationRead(req, "research_adviser", req.user.id, notif.id);
  res.json({ message: "Notification marked as read" });
};

exports.getStudentNotifications = async (req, res) => {
  try {
    if (!isEligibleResearchStudent(req.user)) {
      return res.status(403).json({
        message: "Notifications are only available to eligible research students.",
      });
    }

    // Make sure req.user.id is available (authMiddleware must be used)
    const notifications = await Notification.findAll({
      where: { studentId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

exports.markStudentNotificationRead = async (req, res) => {
  try {
    if (!isEligibleResearchStudent(req.user)) {
      return res.status(403).json({
        message: "Notifications are only available to eligible research students.",
      });
    }

    const notif = await Notification.findOne({
      where: { id: req.params.id, studentId: req.user.id }
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.isRead = true;
    await notif.save();
    emitNotificationRead(req, "student", req.user.id, notif.id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllStudentNotificationsRead = async (req, res) => {
  if (!isEligibleResearchStudent(req.user)) {
    return res.status(403).json({
      message: "Notifications are only available to eligible research students.",
    });
  }

  await Notification.update({ isRead: true }, { where: { studentId: req.user.id, isRead: false } });
  emitNotificationRead(req, "student", req.user.id, null);
  res.json({ message: "All notifications marked as read" });
};

exports.getProjectTimeline = async (req, res) => {
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
        const eventType = getTimelineEventType(item);

        return {
          id: item.id,
          projectId: item.projectId,
          eventType,
          actorRole: getTimelineActorRole(item, project),
          recipientRole: getNotificationOwnerRole(item),
          researchAdviserId: item.researchAdviserId,
          studentId: item.studentId,
          researchCoordinatorId: item.researchCoordinatorId,
          message: item.reason || "",
          timestamp: item.createdAt,
        };
      }).filter((event) => timelineEventIsVisibleToUser(event, req.user));

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
};

exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        researchCoordinatorId: req.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAdminNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, researchCoordinatorId: req.user.id }
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.isRead = true;
    await notif.save();
    emitNotificationRead(req, "admin", req.user.id, notif.id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
