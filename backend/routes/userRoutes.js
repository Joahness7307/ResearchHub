// userRoutes.js
const express = require("express");
const { register, login, forgotPassword, resetPassword, inviteUser, getInvitationInfo, setupAccount, getAllUsers, getUserCount, addUser, updateOwnProfile, updateUser, deleteUser, getUserProfile, getUserProjects } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes - no role protection needed
router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Invite and setup routes
router.post("/invite-user", authMiddleware(["admin"]), inviteUser); 
router.get("/invitation-info", getInvitationInfo);
router.post("/setup-account", setupAccount);

// Admin-only routes for user management (list, count, add, update, delete)
router.get("/all", authMiddleware(["admin"]), getAllUsers);
router.get("/count", authMiddleware(["admin"]), getUserCount);
router.post("/add", authMiddleware(["admin"]), addUser);
router.put("/update/:id", authMiddleware(["admin"]), updateUser);
router.delete("/delete/:id", authMiddleware(["admin"]), deleteUser);

// Protected route to get user profile
router.get("/profile", authMiddleware(), getUserProfile); 
router.put("/profile/update", authMiddleware(["student", "admin", "research_adviser", "head_admin", "guest"]), updateOwnProfile);
// Get all research projects submitted by the logged-in user
router.get("/my-projects", authMiddleware(["student", "admin", "research_adviser", "head_admin"]), getUserProjects);

module.exports = router;