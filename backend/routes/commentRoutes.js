const express = require("express");
const { addComment, getComments } = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/:paperId", getComments); // Public
router.post("/:paperId", authMiddleware(["student", "admin"]), addComment); // Authenticated

module.exports = router;