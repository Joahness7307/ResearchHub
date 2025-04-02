const express = require("express");
const { submitResearch } = require("../controllers/researchController");
const authMiddleware = require("../middlewares/authMiddleware"); // Ensure this checks user roles

const router = express.Router();

// Only students can submit research papers
router.post("/submit", authMiddleware(["student"]), submitResearch);

module.exports = router;
