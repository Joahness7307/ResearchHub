const express = require("express");

const { getResearchCoordinatorNotifications, 
  getResearchAdviserNotifications, 
  markResearchAdviserNotificationRead, 
  markResearchCoordinatorNotificationRead, 
  getAdminNotifications,
  markAdminNotificationRead,
  getStudentNotifications,  
  markStudentNotificationRead, 
  markAllStudentNotificationsRead, 
  getProjectTimeline 
} = require("../controllers/notificationController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/research-adviser/:id", 
  authMiddleware(["research_adviser"]), 
  getResearchAdviserNotifications
);

router.patch(
  "/research-adviser/:id/read", 
  authMiddleware(["research_adviser"]), 
  markResearchAdviserNotificationRead
);

router.get(
  "/research-coordinator/:id", 
  authMiddleware(["research_coordinator"]), 
  getResearchCoordinatorNotifications
);

router.patch(
  "/research-coordinator/:id/read", 
  authMiddleware(["research_coordinator"]), 
  markResearchCoordinatorNotificationRead
);

router.get(
  "/admin/:id",
  authMiddleware(["admin"]),
  getAdminNotifications
);

router.patch(
  "/admin/:id/read",
  authMiddleware(["admin"]),
  markAdminNotificationRead
);

router.get(
  "/student", 
  authMiddleware(["student"]), 
  getStudentNotifications
);

router.patch(
  "/student/mark-all-read", 
  authMiddleware(["student"]), 
  markAllStudentNotificationsRead
);

router.patch(
  "/student/:id/read", 
  authMiddleware(["student"]), 
  markStudentNotificationRead
)

router.get(
  "/project/:projectId/timeline",
  authMiddleware([
    "student", 
    "admin", 
    "research_coordinator", 
    "research_adviser"
  ]), 
  getProjectTimeline
);

module.exports = router;
