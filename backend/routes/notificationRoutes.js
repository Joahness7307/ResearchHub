const express = require("express");
const router = express.Router();
const { Notification } = require("../models");

const { getHeadAdminNotifications, markNotificationRead, getStudentNotifications, markStudentNotificationRead } = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const { isEligibleResearchStudent } = require("../utils/studentEligibility");

router.get("/adviser/:id", authMiddleware(["research_adviser"]), async (req, res) => {
  const notifications = await Notification.findAll({
    where: { adviserId: req.params.id },
    order: [["createdAt", "DESC"]],
  });
  res.json({ notifications });
});
router.patch("/adviser/:id/read", authMiddleware(["research_adviser"]), async (req, res) => {
  const notif = await Notification.findOne({
    where: { id: req.params.id, adviserId: req.user.id }
  });
  if (!notif) return res.status(404).json({ message: "Notification not found" });
  notif.isRead = true;
  await notif.save();
  res.json({ message: "Notification marked as read" });
});
router.get("/head-admin/:id", authMiddleware(["head_admin"]), getHeadAdminNotifications);
router.patch("/head-admin/:id/read", authMiddleware(["head_admin"]), markNotificationRead);

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
