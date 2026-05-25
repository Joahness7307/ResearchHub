const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addBookmark, removeBookmark, getUserBookmarks, isBookmarked } = require("../controllers/bookmarkController");

// Add bookmark
router.post("/:projectId", authMiddleware(["student", "guest", "research_adviser", "research_coordinator", "admin"]), addBookmark);
// Remove bookmark
router.delete("/:projectId", authMiddleware(["student", "guest", "research_adviser", "research_coordinator", "admin"]), removeBookmark);
// Get all bookmarks for user
router.get("/my", authMiddleware(["student", "guest", "research_adviser", "research_coordinator", "admin"]), getUserBookmarks);
// Check if bookmarked
router.get("/is-bookmarked/:projectId", authMiddleware(["student", "guest", "research_adviser", "research_coordinator", "admin"]), isBookmarked);
module.exports = router;