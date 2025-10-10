// userRoutes.js
const express = require("express");
const { register, login, forgotPassword, resetPassword, inviteUser, getInvitationInfo, setupAccount, getAllUsers, addUser, updateOwnProfile, updateUser, deleteUser, getUserProfile, getUserProjects } = require("../controllers/userController"); // Import getUserProfile
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

// Admin-only routes for adding, updating, and deleting users
router.get("/all", authMiddleware(["admin"]), getAllUsers);
router.post("/add", authMiddleware(["admin", "research_adviser"]), addUser);
router.put("/update/:id", authMiddleware(["admin", "research_adviser"]), updateUser);
router.delete("/delete/:id", authMiddleware(["admin", "research_adviser"]), deleteUser);

// Protected route to get user profile
router.get("/profile", authMiddleware(), getUserProfile); // Uses authMiddleware to verify token and populate req.user
router.put("/profile/update", authMiddleware(["student", "admin"]), updateOwnProfile);
// Get all research projects submitted by the logged-in user
router.get("/my-projects", authMiddleware(["student", "admin"]), getUserProjects);

module.exports = router;