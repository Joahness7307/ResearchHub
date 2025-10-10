const express = require("express");
const router = express.Router();
const { Notification } = require("../models");

const { getAdminNotifications, markNotificationRead, getStudentNotifications, markStudentNotificationRead } = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");

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
router.get("/admin/notifications", authMiddleware(["admin", "head_admin"]), getAdminNotifications);
router.patch("/admin/notifications/:id/read", authMiddleware(["admin", "head_admin"]), markNotificationRead);

router.get("/student/notifications", authMiddleware(["student"]), getStudentNotifications);
router.patch("/student/notifications/mark-all-read", authMiddleware(["student"]), async (req, res) => {
  await Notification.update({ isRead: true }, { where: { studentId: req.user.id, isRead: false } });
  res.json({ message: "All notifications marked as read" });
});
router.patch("/student/notifications/:id/read", authMiddleware(["student"]), markStudentNotificationRead);

module.exports = router;