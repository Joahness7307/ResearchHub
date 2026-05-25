const express = require("express");
const { addComment, getComments } = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/:projectId", getComments); // Public
 router.post("/:projectId", authMiddleware(["student", "guest", "research_adviser", "research_coordinator", "admin"]), addComment); // Authenticated

module.exports = router;