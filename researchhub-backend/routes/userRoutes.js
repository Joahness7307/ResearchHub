const express = require("express");
const { register, login, addUser, updateUser, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes - no role protection needed
router.post("/register", register);
router.post("/login", login);

// Admin-only routes for adding, updating, and deleting users
router.post("/add", authMiddleware(["admin"]), addUser);        // Only Admin can add user
router.put("/update/:id", authMiddleware(["admin"]), updateUser); // Only Admin can update user
router.delete("/delete/:id", authMiddleware(["admin"]), deleteUser); // Only Admin can delete user

module.exports = router;
