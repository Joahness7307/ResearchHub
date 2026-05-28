const express = require("express");
const { submitProject, 
        getAllProjects, 
        getPublicProjectCounts, 
        getSingleProject, 
        getProjectCounts, 
        getResearchAdviserProjects, 
        downloadProjectDocument, 
        endorseProject, 
        needRevision, 
        approveProject, 
        getAllProjectsAdmin, 
        editProjectMetadata, 
        hideProject, 
        deleteProject, 
        informStudentOfRevision, 
        reuploadProjectDocument  
} = require("../controllers/projectController");

const categories = require("../config/categories");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

const router = express.Router();

// Dynamic categories endpoint
router.get("/categories", (req, res) => {
  res.json({ categories });
});

// Only students can upload research papers
router.post(
  "/submit", 
  authMiddleware(["student"]), 
  upload.single("document"), 
  submitProject
);

// Anyone logged in can view repository
router.get("/", getAllProjects);

// Get all projects visible to this researchadviser (pending in their strand/department)
router.get(
  "/research-adviser/all", 
  authMiddleware(["research_adviser"]), 
  getResearchAdviserProjects
);

// Research Coordinator Management
router.get(
  "/research-coordinator/all", 
  authMiddleware(["research_coordinator"]), 
  getAllProjectsAdmin
);

// Admin Management
router.get(
  "/admin/all", 
  authMiddleware(["admin"]), 
  getAllProjectsAdmin
);

router.get(
  "/admin/counts", 
  authMiddleware(["admin"]), 
  getProjectCounts
);

router.post(
  "/admin/approve/:id", 
  authMiddleware(["admin", "research_coordinator"]), 
  approveProject
);

// Edit metadata (title, abstract, etc.)
router.put(
  "/admin/edit/:id", 
  authMiddleware(["admin", "research_coordinator"]), 
  editProjectMetadata
);

// Hide/Unpublish project
router.patch(
  "/admin/hide/:id", 
  authMiddleware(["admin", "research_coordinator"]), 
  hideProject
);

// Delete/Archive project
router.delete(
  "/admin/delete/:id", 
  authMiddleware(["admin", "research_coordinator"]), 
  deleteProject
);

// Public counts for Student/Guest dashboard cards
router.get("/public/counts", getPublicProjectCounts);

router.get("/download/:id", downloadProjectDocument);

router.post(
  "/research-adviser/endorse/:id", 
  authMiddleware(["research_adviser"]), 
  endorseProject
);
router.post(
  "/research-adviser/need-revision/:id", 
  authMiddleware(["research_adviser"]), 
  needRevision
);
router.post(
  "/admin/need-revision/:id", 
  authMiddleware(["admin", "research_coordinator"]), 
  needRevision
);
router.post(
  "/research-adviser/inform-student/:id", 
  authMiddleware(["research_adviser"]), 
  informStudentOfRevision
);

router.put(
  "/reupload/:id", 
  authMiddleware(["student"]), 
  upload.single("document"), 
  reuploadProjectDocument
);

// Get single project
router.get(
  "/:id", 
  authMiddleware([
    "student", 
    "admin", 
    "research_coordinator",
    "research_adviser", 
    "guest"]), 
  getSingleProject
);

module.exports = router;