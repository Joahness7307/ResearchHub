const { Project, User, Notification } = require("../models");
const path = require("path");
const fs = require("fs");

// Upload final research paper
exports.submitProject = async (req, res) => {
  try {
    const user = req.user;
      if (
        (user.year_level && !["3rd", "4th"].includes(user.year_level)) ||
        (user.grade_level && user.grade_level !== "12")
      ) {
        return res.status(403).json({ message: "You are not eligible to submit a research project." });
      }
    const {
      title,
      title_description,
      abstract,
      category
    } = req.body;

    const documentUrl = req.file?.path || req.file?.secure_url; // ✅ safer cloudinary URL
    
    console.log("📄 Uploaded PDF URL:", req.file?.path);

    // Validate required fields for all
    if (!title || !title_description || !abstract || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Project PDF is required." });
    }
    
    // Use full_name for authors
    const authors = user.full_name || user.username || "Unknown";

     // Find adviser
    let adviser;
    if (user.year_level) {
      adviser = await User.findOne({ where: { role: "research_adviser", department: user.department } });
    } else if (user.grade_level) {
      adviser = await User.findOne({ where: { role: "research_adviser", strand: user.strand } });
    }
    const adviserId = adviser ? adviser.id : null;

    // Create project
    const project = await Project.create({
      title,
      title_description,
      abstract,
      category,
      documentPath: documentUrl,
      authors: user.full_name,
      submitted_by: user.id,
      adviser_id: adviserId,
      status: "pending"
    });

    // Notify student of their own submission
    await Notification.create({
      projectId: project.id,
      studentId: user.id,
      isRead: false,
      reason: `You submitted the project "${project.title}".`,
    });

    // Emit socket event to student for real-time notification
    const io = req.app.get("io");
    if (io) {
      io.emit(`student_notify_${user.id}`, {
        type: "submission",
        message: `You submitted the project "${project.title}".`
      });
    }

    // Create notification for adviser
    if (adviserId) {
      await Notification.create({
        projectId: project.id,
        adviserId,
        isRead: false,
        reason: `${user.full_name} submitted a research project entitled "${project.title}".`,
      });
    } 

      // Real-time notification via socket.io
      if (io) {
        io.emit(`adviser_notify_${adviserId}`, {          
          title,
          student: user.full_name,
          time: new Date().toLocaleString(),
          message: `${user.full_name} submitted a research project entitled "${project.title}".`
        });
      }

    res.status(201).json({ message: "Project submitted successfully!", Project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit project.", error: error.message });
  }
};

exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { adminId: req.user.id },
      include: [{ model: Project }],
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
    // Make sure req.user.id is available (authMiddleware must be used)
    const notifications = await Notification.findAll({
      where: { studentId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
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
// NEW: Get total project counts grouped by status (for Admin Dashboard)
exports.getProjectCounts = async (req, res) => {
  try {
    // 1. Fetch counts grouped by status
    const counts = await Project.findAll({
      attributes: [
        'status',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // 2. Map results to a simpler object for easier access
    const countMap = counts.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.dataValues.count, 10);
      return acc;
    }, {});

    // 3. Calculate the total and group the revision statuses
    const totalProjects = counts.reduce((sum, curr) => sum + parseInt(curr.dataValues.count, 10), 0);

    // Combine 'need_revision', 'admin_revision', and potentially 'rejected' into 'revision'
    const revisionCount = 
      (countMap['need_revision'] || 0) + 
      (countMap['admin_revision'] || 0) +
      (countMap['rejected'] || 0); // Include 'rejected' just in case it's still used

    // 4. Map the final desired status names for the frontend
    const results = {
      totalProjects: totalProjects,
      'pending': countMap['pending'] || 0,
      'endorsed': countMap['endorsed'] || 0, // Endorsed is kept separate as requested
      'approved': countMap['approved'] || 0,
      'revision': revisionCount, // This is the new combined count
    };

    res.status(200).json(results);
  } catch (error) {
    console.error("getProjectCounts error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all research projects (repository)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { status: "approved" },
      include: [{ model: User, as: "submitter", attributes: ["department", "year_level", "strand", "grade_level"] }]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Research adviser endorses project to admin
exports.endorseProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "pending") return res.status(400).json({ message: "Project is not pending" });

    await project.update({
      status: "endorsed",
      last_updated_by_role: req.user.role // <-- Set who endorsed
    });

    // Notify student
    await Notification.create({
      projectId: project.id,
      studentId: project.submitted_by,
      isRead: false,
      reason: `Your project "${project.title}" was endorsed for admin's approval.`,
    });

    // Notify adviser
    await Notification.create({
      projectId: project.id,
      adviserId: req.user.id,
      isRead: false,
      reason: `You endorsed a project "${project.title}" for admin's approval.`,
    });

    // Notify head admin(s)
    const headAdmins = await User.findAll({ where: { role: "head_admin" } });
    for (const headAdmin of headAdmins) {
      await Notification.create({
        projectId: project.id,
        adminId: headAdmin.id,
        isRead: false,
        reason: `A project "${project.title}" has been reviewed and endorsed by the research adviser "${req.user.full_name}".`
      });
    }

    res.json({ message: "Project endorsed to admin for approval." });
  } catch (error) {
    res.status(500).json({ message: "Failed to endorse project.", error: error.message });
  }
};

exports.needRevision = async (req, res) => {
  try {
    const user = req.user;
    const { reason } = req.body;
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (user.role === "head_admin" || user.role === "admin") {
      await project.update({
        status: "admin_revision",
        rejection_reason: reason,
        last_updated_by_role: user.role
      });
      await Notification.create({
        projectId: project.id,
        adviserId: project.adviser_id,
        isRead: false,
        reason: `The project "${project.title}" you endorsed requires revision. Reason: ${reason}`,
      });
      return res.json({ message: "Adviser notified for revision." });
    }

    if (user.role === "research_adviser") {
      await project.update({
        status: "need_revision",
        rejection_reason: reason,
        last_updated_by_role: user.role
      });
      await Notification.create({
        projectId: project.id,
        studentId: project.submitted_by,
        isRead: false,
        reason: `Your project "${project.title}" requires revision. Reason: ${reason}`,
      });
      return res.json({ message: "Student notified for revision." });
    }

    res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("needRevision error:", error);
    res.status(500).json({ message: "Failed to mark as need revision.", error: error.message });
  }
};

exports.informStudentOfRevision = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await project.update({ status: "need_revision", last_updated_by_role: "research_adviser" });

    await Notification.create({
      projectId: project.id,
      studentId: project.submitted_by,
      isRead: false,
      reason: `Your project "${project.title}" requires revision. Please reupload your updated document.`,
    });
    res.json({ message: "Student notified of revision." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reuploadProjectDocument = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.submitted_by !== req.user.id) return res.status(403).json({ message: "Not your project" });
    const documentUrl = req.file?.path || req.file?.secure_url;
    await project.update({ documentPath: documentUrl, status: "pending" });
    res.json({ message: "Project reuploaded and set to pending." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveProject = async (req, res) => {
  await Project.update(
    { status: "approved", last_updated_by_role: req.user.role }, // <-- Add this
    { where: { id: req.params.id } }
  );
  const project = await Project.findByPk(req.params.id);

  // Notify head admin (self)
  await Notification.create({
    projectId: project.id,
    adminId: req.user.id,
    isRead: false,
    reason: `You uploaded a project "${project.title}" in the repository..`,
  });

  // Notify student
  await Notification.create({
    projectId: project.id,
    studentId: project.submitted_by,
    isRead: false,
    reason: `Your submitted project "${project.title}" has been approved, and it's already stored in the repository.`,
  });

  // Notify adviser
  await Notification.create({
    projectId: project.id,
    adviserId: project.adviser_id,
    isRead: false,
    reason: `The project "${project.title}" that you endorsed has been approved, and it's already stored in the repository.`,
  });

  res.status(200).json({ message: "Research project approved" });
};

exports.getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["created_at", "DESC"]]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editProjectMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_description, abstract, category } = req.body;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await project.update({ title, title_description, abstract, category });
    res.json({ message: "Project metadata updated", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.hideProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await project.update({ status: "hidden" });
    res.json({ message: "Project hidden/unpublished" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    // Delete notifications first
    await Notification.destroy({ where: { projectId: req.params.id } });
    // Then delete the project
    await Project.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Research project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};