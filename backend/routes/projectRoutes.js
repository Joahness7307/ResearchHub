const express = require("express");
const path = require("path");
const { submitProject, getResearchCoordinatorNotifications, markNotificationRead, getStudentNotifications, getAllProjects, getProjectCounts, endorseProject, needRevision, approveProject, getAllProjectsAdmin, editProjectMetadata, hideProject, deleteProject, informStudentOfRevision, reuploadProjectDocument  } = require("../controllers/projectController");
const categories = require("../config/categories");
const { Project, User } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
const axios = require("axios");
const { Op } = require("sequelize");  // ← ADD THIS LINE near top
const router = express.Router();

const STUDENT_INTERNAL_STATUS_MAP = {
  admin_revision: "endorsed",
};

function serializeProjectForRole(project, role) {
  const data = typeof project.toJSON === "function" ? project.toJSON() : { ...project };

  if (role === "student" && STUDENT_INTERNAL_STATUS_MAP[data.status]) {
    return {
      ...data,
      status: STUDENT_INTERNAL_STATUS_MAP[data.status],
      internal_status: data.status,
      rejection_reason: null,
    };
  }

  return data;
}

// Dynamic categories endpoint
router.get("/categories", (req, res) => {
  res.json({ categories });
});

// Only students can upload research papers
router.post("/submit", authMiddleware(["student"]), upload.single("document"), submitProject);

// Anyone logged in can view repository
router.get("/", getAllProjects);

// Public counts for Student/Guest dashboard cards
router.get("/public/counts", async (req, res) => {
  try {
    const totalApproved = await Project.count({
      where: { status: "approved" }
    });

    const collegeApproved = await Project.count({
      where: {
        status: "approved",
        strand_id: { [Op.is]: null }  // college projects have no strand
      }
    });

    const shsApproved = await Project.count({
      where: {
        status: "approved",
        strand_id: { [Op.not]: null }  // senior high have strand
      }
    });

    res.json({
      all: totalApproved,
      college: collegeApproved,
      senior_high: shsApproved
    });
  } catch (error) {
    console.error("Public counts error:", error);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});

// Get sinlge research project
router.get("/:id", authMiddleware(["student", "admin", "research_coordinator", "research_adviser", "guest"]), async (req, res) => {
  try {
    const { id } = req.params; // <-- FIX: get id from params
    const project = await Project.findByPk(id, {
      include: [{ model: User, as: "submitter", attributes: ["id", "full_name", "email", "role"] }]
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(serializeProjectForRole(project, req.user.role));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all projects visible to this adviser (pending in their strand/department)
router.get("/adviser/all", authMiddleware(["research_adviser"]), async (req, res) => {
  try {
    const user = req.user;

    // Build query based on adviser's affiliation
    const where = {
      status: { [Op.in]: ["pending", "approved", "need_revision", "endorsed", "admin_revision"] } // add statuses you want visible
    };

    if (user.department_id) {
      where.department_id = user.department_id;
    } else if (user.strand_id) {
      where.strand_id = user.strand_id;
    } else {
      return res.status(403).json({ message: "Adviser not assigned to any department or strand" });
    }

    const projects = await Project.findAll({
      where,
      include: [
        { 
          model: User, 
          as: "submitter", 
          attributes: ["id", "full_name", "email", "grade_level", "year_level"] 
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(projects);
  } catch (error) {
    console.error("Adviser projects error:", error);
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
    const response = await axios.get(project.documentPath, 
      { responseType: "stream"
      });

    // Set the download header
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${project.title ? project.title.replace(/[^a-z0-9]/gi, "_") : "project"}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Pipe the PDF stream to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Failed to download PDF", error: error.message });
  }
});

router.post("/adviser/endorse/:id", authMiddleware(["research_adviser"]), endorseProject);
router.post("/adviser/need-revision/:id", authMiddleware(["research_adviser"]), needRevision);
router.post("/admin/need-revision/:id", authMiddleware(["admin", "research_coordinator"]), needRevision);

// Research Coordinator Management
router.get("/research-coordinator/all", authMiddleware(["research_coordinator"]), getAllProjectsAdmin);
router.get("/research-coordinator/notifications", authMiddleware(["research_coordinator"]), getResearchCoordinatorNotifications);
router.patch("/research-coordinator/notifications/:id/read", authMiddleware(["research_coordinator"]), markNotificationRead);

// Admin Management
router.get("/admin/all", authMiddleware(["admin"]), getAllProjectsAdmin);
router.get("/admin/counts", authMiddleware(["admin"]), getProjectCounts);
// router.get("/admin/notifications", authMiddleware(["admin"]), getAdminNotifications);
// router.patch("/admin/notifications/:id/read", authMiddleware(["admin"]), markNotificationRead);

router.get("/student/notifications", authMiddleware(["student"]), getStudentNotifications);
router.post("/admin/approve/:id", authMiddleware(["admin", "research_coordinator"]), approveProject);

router.post("/adviser/inform-student/:id", authMiddleware(["research_adviser"]), informStudentOfRevision);

router.put("/reupload/:id", authMiddleware(["student"]), upload.single("document"), reuploadProjectDocument);

// Edit metadata (title, abstract, etc.)
router.put("/admin/edit/:id", authMiddleware(["admin", "research_coordinator"]), editProjectMetadata);

// Hide/Unpublish project
router.patch("/admin/hide/:id", authMiddleware(["admin", "research_coordinator"]), hideProject);

// Delete/Archive project
router.delete("/admin/delete/:id", authMiddleware(["admin", "research_coordinator"]), deleteProject);


module.exports = router;
