// filepath: backend/middlewares/multer-profile.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Allowed image MIME types
const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine the folder for profile pictures
    let folder = "user_profiles";

    return {
      folder: folder,
      resource_type: "image", // Crucial for image uploads
      allowed_formats: ["jpg", "jpeg", "png", "gif"], // Cloudinary formats
      public_id: `profile-${req.user.id}-${Date.now()}`, // Unique ID based on user
      tags: [
        folder,
        req.user.full_name || "anonymous",
        req.user.role || "unknown_role"
      ],
    };
  },
});

const uploadProfilePic = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size for images
  },
  fileFilter: (req, file, cb) => {
    if (allowedImageMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only JPG, PNG, and GIF image files are allowed"));
    }
  },
});

module.exports = uploadProfilePic;