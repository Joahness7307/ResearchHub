// Modified backend/projectRoutes.js
const express = require("express");
const path = require("path");
const { submitProject, getAdminNotifications, markNotificationRead, getStudentNotifications, getAllProjects, getProjectCounts, endorseProject, needRevision, approveProject, getAllProjectsAdmin, editProjectMetadata, hideProject, deleteProject, informStudentOfRevision, reuploadProjectDocument, toggleLike, getLikes, toggleBookmark, getBookmarks, getMyBookmarks, getUserBookmarks, getCommentCount  } = require("../controllers/projectController");
const categories = require("../config/categories");
const { Project, User } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
const axios = require("axios");
const router = express.Router();

// Dynamic categories endpoint
router.get("/categories", (req, res) => {
  res.json({ categories });
});

// Only students can upload research papers
router.post("/submit", authMiddleware(["student"]), upload.single("document"), submitProject);

// Anyone logged in can view repository
router.get("/", getAllProjects);

router.get("/counts", authMiddleware(["admin"]), getProjectCounts);

// Get single research project
router.get("/:id", authMiddleware(["student", "admin", "head_admin", "research_adviser", "guest"]), async (req, res) => {
  try {
    const { id } = req.params; // <-- FIX: get id from params
    const project = await Project.findByPk(id, {
      include: [{ model: User, as: "submitter", attributes: ["id", "full_name", "email", "role"] }]
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all projects assigned to this adviser (including pending)
router.get("/adviser/all", authMiddleware(["research_adviser"]), async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { adviser_id: req.user.id },
      order: [["created_at", "DESC"]]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/download/:id", async (req, res) => {
  try {
    // Find the project by ID
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project || !project.documentPath) {
      return res.status(404).json({ message: "Project or document not found" });
    }

    // Stream the PDF from Cloudinary
    const response = await axios.get(project.documentPath, { responseType: "stream" });

    // Set the download header
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${project.title ? project.title.replace(/[^a-z0-9]/gi, "_") : "project"}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF stream to the response
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Failed to download PDF", error: error.message });
  }
});

router.post("/adviser/endorse/:id", authMiddleware(["research_adviser"]), endorseProject);
router.post("/adviser/need-revision/:id", authMiddleware(["research_adviser"]), needRevision);
router.post("/admin/need-revision/:id", authMiddleware(["admin", "head_admin"]), needRevision);

// <Admins></Admins>
router.get("/admin/all", authMiddleware(["admin", "head_admin"]), getAllProjectsAdmin);
router.get("/admin/notifications", authMiddleware(["admin"]), getAdminNotifications);
router.patch("/admin/notifications/:id/read", authMiddleware(["admin"]), markNotificationRead);
router.get("/student/notifications", authMiddleware(["student"]), getStudentNotifications);
router.post("/admin/approve/:id", authMiddleware(["admin", "head_admin"]), approveProject);

router.post("/adviser/inform-student/:id", authMiddleware(["research_adviser"]), informStudentOfRevision);

router.put("/reupload/:id", authMiddleware(["student"]), upload.single("document"), reuploadProjectDocument);

// Like endpoints
router.post("/:id/like", authMiddleware(), toggleLike);
router.get("/:id/likes", getLikes);

// Bookmark endpoints
router.post("/:id/bookmark", authMiddleware(), toggleBookmark);
router.get("/:id/bookmarks", getBookmarks);

// Get user's bookmarked projects
router.get("/my-bookmarks", authMiddleware(), getMyBookmarks);

router.get("/bookmarks/:userId", authMiddleware(), getUserBookmarks);

// Get comment count for a project
router.get("/:id/comments/count", getCommentCount);

// Edit metadata (title, abstract, etc.)
router.put("/admin/edit/:id", authMiddleware(["admin", "head_admin"]), editProjectMetadata);

// Hide/Unpublish project
router.patch("/admin/hide/:id", authMiddleware(["admin", "head_admin"]), hideProject);

// Delete/Archive project
router.delete("/admin/delete/:id", authMiddleware(["admin", "head_admin"]), deleteProject);


module.exports = router;  