const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Default folder
    let folder = "researchhub_projects";

    // Handle role-specific folders if user exists
    if (req.user) {
      if (req.user.year_level) folder = "college_projects";
      else if (req.user.grade_level) folder = "shs_projects";
    }

    return {
      folder,
      resource_type: "auto", // Required for PDFs
      format: "pdf", // Force PDF format
      allowed_formats: ["pdf"],
      public_id: `project-${Date.now()}.pdf`, // Unique file name
      tags: [
        folder,
        req.user?.full_name || "anonymous",
        req.user?.role || "unknown_role"
      ],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only PDF files are allowed"));
    }
  },
});

module.exports = upload;
