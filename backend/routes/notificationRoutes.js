const express = require("express");
const router = express.Router();

const { getAdminNotifications, markNotificationRead, getStudentNotifications, markStudentNotificationRead } = require("../controllers/researchController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/admin/notifications", authMiddleware(["admin"]), getAdminNotifications);
router.patch("/admin/notifications/:id/read", authMiddleware(["admin"]), markNotificationRead);

router.get("/student/notifications", authMiddleware(["student"]), getStudentNotifications);
router.patch("/student/notifications/:id/read", authMiddleware(["student"]), markStudentNotificationRead);

module.exports = router;