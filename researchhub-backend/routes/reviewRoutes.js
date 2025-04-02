const express = require("express");
const { submitReview } = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Only teachers/admins can review a research paper
router.post("/submit", authMiddleware(["teacher", "admin"]), submitReview);

module.exports = router;
