const { ResearchPaper, User, Notification } = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/research_documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'), false);
  },
}).single('document');

// Upload final research paper
exports.submitResearch = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    const { title, abstract, authors, category } = req.body;

    // ✨ CRITICAL: Ensure you are using req.file.filename here, NOT req.file.path
    const documentFilename = req.file ? req.file.filename : null;
    const documentPathForDB = documentFilename ? `uploads/research_documents/${documentFilename}` : null;


    if (!title || !abstract || !authors || !category || !documentPathForDB) {
      // If there's an error, try to clean up the uploaded file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "All fields and a PDF document are required." });
    }

    if (!req.user || req.user.role !== 'student') {
      // Clean up if unauthorized
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: "Forbidden: Only students can upload research papers." });
    }

    try {
      const paper = await ResearchPaper.create({
        title,
        abstract,
        authors,
        category,
        documentPath: documentPathForDB, // Store the correct relative path
        submittedBy: req.user.id,
        status: "pending",
      });

      const admins = await User.findAll({ where: { role: "admin" } });
      for (const admin of admins) {
        await Notification.create({
          paperId: paper.id,
          adminId: admin.id,
          isRead: false
        });
      }

      // Emit socket event for admin notification
      const io = req.app.get("io");
      if (io) {
        io.emit("new_research_submission", {
          id: paper.id,
          title: paper.title,
          authors: paper.authors,
          category: paper.category,
          createdAt: paper.createdAt,
        });
      }

      res.status(201).json({ message: "Research paper uploaded successfully!", paper });
    } catch (error) {
      console.error("Error submitting research paper:", error); // Log the actual error
      // Clean up uploaded file if database insertion fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  })
};

exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { adminId: req.user.id },
      include: [{ model: ResearchPaper }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, adminId: req.user.id }
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.isRead = true;
    await notif.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { studentId: req.user.id },
      include: [{ model: ResearchPaper }],
      order: [["createdAt", "DESC"]]
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markStudentNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, studentId: req.user.id }
    });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.isRead = true;
    await notif.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all research papers (repository)
exports.getAllResearchPapers = async (req, res) => {
  try {
    const papers = await ResearchPaper.findAll({
      where: { status: "approved" }, // Only approved papers
      include: [{ model: User, as: "student", attributes: ["id", "name", "email"] }]
    });
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.approveResearchPaper = async (req, res) => {
  await ResearchPaper.update({ status: "approved" }, { where: { id: req.params.id } });

  const paper = await ResearchPaper.findByPk(req.params.id);
  await Notification.create({
    paperId: paper.id,
    studentId: paper.submittedBy,
    isRead: false,
    reason: null // No reason for approval
  });

  const io = req.app.get("io");
  if (io) {
    io.emit(`student_notify_${paper.submittedBy}`, {
      paperId: paper.id,
      status: "approved",
      title: paper.title,
      updatedAt: new Date()
    });
  }

  res.status(200).json({ message: "Research paper approved" });
};

exports.rejectResearchPaper = async (req, res) => {
  const { reason } = req.body;
  await ResearchPaper.update(
    { status: "rejected", rejectionReason: reason },
    { where: { id: req.params.id } }
  );

  const paper = await ResearchPaper.findByPk(req.params.id);
  await Notification.create({
    paperId: paper.id,
    studentId: paper.submittedBy,
    isRead: false,
    reason // Save rejection reason
  });

  const io = req.app.get("io");
  if (io) {
    io.emit(`student_notify_${paper.submittedBy}`, {
      paperId: paper.id,
      status: "rejected",
      title: paper.title,
      reason,
      updatedAt: new Date()
    });
  }

  res.status(200).json({ message: "Research paper rejected" });
};

exports.getAllResearchPapersAdmin = async (req, res) => {
  try {
    const papers = await ResearchPaper.findAll();
    res.status(200).json({ papers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteResearchPaper = async (req, res) => {
  try {
    await ResearchPaper.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Research paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};