const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addBookmark, removeBookmark, getUserBookmarks, isBookmarked } = require("../controllers/bookmarkController");

// Add bookmark
router.post("/:projectId", authMiddleware(["student", "guest", "research_adviser", "head_admin", "admin"]), addBookmark);
// Remove bookmark
router.delete("/:projectId", authMiddleware(["student", "guest", "research_adviser", "head_admin", "admin"]), removeBookmark);
// Get all bookmarks for user
router.get("/my", authMiddleware(["student", "guest", "research_adviser", "head_admin", "admin"]), getUserBookmarks);
// Check if bookmarked
router.get("/is-bookmarked/:projectId", authMiddleware(["student", "guest", "research_adviser", "head_admin", "admin"]), isBookmarked);
module.exports = router;