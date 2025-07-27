const express = require("express");
const { submitResearch, getAdminNotifications, markNotificationRead, getAllResearchPapers, approveResearchPaper, rejectResearchPaper, getAllResearchPapersAdmin, deleteResearchPaper } = require("../controllers/researchController");
const categories = require("../config/categories");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Dynamic categories endpoint
router.get("/categories", (req, res) => {
  res.json({ categories });
});

// Only students can upload research papers
router.post("/submit", authMiddleware(["student"]), submitResearch);

// Anyone logged in can view repository
router.get("/", authMiddleware(["student", "admin"]), getAllResearchPapers);

// Get sinlge research project
router.get("/:id", authMiddleware(["student", "admin"]), async (req, res) => {
  const { ResearchPaper, User } = require("../models");
  const paper = await ResearchPaper.findByPk(req.params.id, {
    include: [{ model: User, as: "student", attributes: ["id", "name", "email"] }]
  });
  if (!paper) return res.status(404).json({ message: "Research paper not found" });
  res.json(paper);
});

// <Admins></Admins>
router.get("/admin/all", authMiddleware(["admin"]), getAllResearchPapersAdmin);
router.get("/admin/notifications", authMiddleware(["admin"]), getAdminNotifications);
router.patch("/admin/notifications/:id/read", authMiddleware(["admin"]), markNotificationRead);
router.post("/admin/approve/:id", authMiddleware(["admin"]), approveResearchPaper);
router.post("/admin/reject/:id", authMiddleware(["admin"]), rejectResearchPaper);
router.delete("/admin/delete/:id", authMiddleware(["admin"]), deleteResearchPaper);

module.exports = router;