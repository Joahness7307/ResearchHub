// userRoutes.js
const express = require("express");
const { register, login, getAllUsers, addUser, updateOwnProfile, updateUser, deleteUser, getUserProfile, getUserResearchPapers } = require("../controllers/userController"); // Import getUserProfile
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes - no role protection needed
router.post("/register", register);
router.post("/login", login);

// Admin-only routes for adding, updating, and deleting users
router.get("/all", authMiddleware(["admin"]), getAllUsers);
router.post("/add", authMiddleware(["admin"]), addUser);           // Only Admin can add user
router.put("/update/:id", authMiddleware(["admin"]), updateUser); // Only Admin can update user
router.delete("/delete/:id", authMiddleware(["admin"]), deleteUser); // Only Admin can delete user

// Protected route to get user profile
router.get("/profile", authMiddleware(["student", "admin"]), getUserProfile); // Uses authMiddleware to verify token and populate req.user
router.put("/profile/update", authMiddleware(["student", "admin"]), updateOwnProfile);
// Get all research papers submitted by the logged-in user
router.get("/my-papers", authMiddleware(["student", "admin"]), getUserResearchPapers);

module.exports = router;