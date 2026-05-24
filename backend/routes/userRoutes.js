// userRoutes.js
const express = require("express");
const { register, login, getAllUsers, getUserCount, addUser, updateOwnProfile, updateUser, deleteUser, getUserProfile, getUserProjects, forceChangePassword } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadProfilePic = require("../config/multer-profile");

const router = express.Router();

// Public routes - no role protection needed
router.post("/register", register);
router.post("/login", login);

// Protected routes - authMiddleware checks for valid token
router.post("/force-change-password", authMiddleware(), forceChangePassword);

// Admin-only (CRUD Operations)
router.get("/all", authMiddleware(["admin"]), getAllUsers);
router.get("/count", authMiddleware(["admin"]), getUserCount);
router.post("/add", authMiddleware(["admin"]), addUser);
router.put("/update/:id", authMiddleware(["admin"]), updateUser);
router.delete("/delete/:id", authMiddleware(["admin"]), deleteUser);

// Protected route to get user profile
router.get("/profile", authMiddleware(), getUserProfile);

// Update profile: auth runs first so req.user is available to multer-profile params
router.put(
  "/profile/update",
  authMiddleware(["student", "admin", "research_adviser", "head_admin", "guest"]),
  uploadProfilePic.single("profile_pic"),
  updateOwnProfile
);

// Get all research projects submitted by the logged-in user
router.get("/my-projects", authMiddleware(["student", "admin", "research_adviser", "head_admin"]), getUserProjects);

module.exports = router;