const { Project, User, Notification, Comment, sequelize } = require("../models");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const { Op } = require("sequelize");
const {
  PROJECT_STATUS,
  notifyStudent,
  notifyProjectAdvisers,
  notifyHeadAdmins,
  emitWorkflowRefresh,
} = require("../services/notificationService");
const { isEligibleResearchStudent } = require("../utils/studentEligibility");

// Upload final research paper
exports.submitProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;

    // Eligibility check (keep this)
    if (!isEligibleResearchStudent(user)) {
      return res.status(403).json({
        message: "You are not eligible to submit a research project."
      });
    }

    const {
      title,
      title_description,
      abstract,
      category
    } = req.body;

    const documentUrl = req.file?.path || req.file?.secure_url;

    console.log("📄 Uploaded PDF URL:", documentUrl);

    // Validate required fields
    if (!title || !title_description || !abstract || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Project PDF is required." });
    }

    // ───────────────────────────────────────────────────────────────
    //              IMPORTANT CHANGES START HERE
    // ───────────────────────────────────────────────────────────────

    // 1. NO MORE adviser check → students can submit without adviser
    // 2. We save department_id / strand_id so future advisers can see it

    const project = await Project.create({
      title,
      title_description,
      abstract,
      category,
      documentPath: documentUrl,
      authors: user.full_name || user.username || "Unknown",
      submitted_by: user.id,

      // ── These two new fields are very important ──
      department_id: user.department_id || null,
      strand_id: user.strand_id || null,

      // No adviser yet → will be assigned later when adviser claims/endorses
      adviser_id: null,
      status: "pending"
    }, { transaction: transaction });

    // ── Student notification (keep this) ──
    await Notification.create({
      projectId: project.id,
      studentId: user.id,
      isRead: false,
      reason: `You submitted the project "${project.title}".`
    }, { transaction: transaction });

    // Notify advisers in the same department/strand inside transaction
    // NEW - safe adviser query with proper warning
    if (user.department_id || user.strand_id) {

      // Build where condition safely - never pass empty {} into Op.or
      const adviserWhere = { role: "research_adviser" };

      if (user.department_id && user.strand_id) {
        // Student has both - match either
        adviserWhere[Op.or] = [
          { department_id: user.department_id },
          { strand_id: user.strand_id }
        ];
      } else if (user.department_id) {
        // College student - match by department only
        adviserWhere.department_id = user.department_id;
      } else if (user.strand_id) {
        // SHS student - match by strand only
        adviserWhere.strand_id = user.strand_id;
      }

      const possibleAdvisers = await User.findAll({
        where: adviserWhere,
        transaction: transaction
      });

      for (const adv of possibleAdvisers) {
        await Notification.create({
          projectId: project.id,
          adviserId: adv.id,
          isRead: false,
          reason: `New pending project in your ${
            user.strand_id ? "strand" : "department"
          }: "${project.title}" by ${user.full_name}`
        }, { transaction: transaction });
      }

    } else {
      // Student has no department or strand - warn in logs
      console.warn(
        `WARNING: Student id=${user.id} (${user.full_name}) submitted project ` +
        `"${project.title}" but has no department_id or strand_id. ` +
        `No adviser was notified. Update this user's academic info.`
      );
    }

    // All database operations succeeded - commit everything
    await transaction.commit();

    // Socket.io notifications AFTER commit
    // (these are real-time only, not database - no transaction needed)
    const io = req.app.get("io");
    if (io) {
      io.emit(`student_notify_${user.id}`, {
        type: "submission",
        message: `You submitted the project "${project.title}".`
      });
    

      if (user.department_id || user.strand_id) {
        const possibleAdvisers = await User.findAll({
          where: {
            role: "research_adviser",
            [Op.or]: [
              user.department_id ? { department_id: user.department_id } : {},
              user.strand_id ? { strand_id: user.strand_id } : {}
            ]
          }
        });

          for (const adv of possibleAdvisers) {
            io.emit(`adviser_notify_${adv.id}`, {
              type: "new_submission",
              title: project.title,
              student: user.full_name,
              time: new Date().toLocaleString(),
              message: `New project waiting in ${user.strand_id ? "strand" : "department"}`
            });
          }
        }
      }

    // Success response
    res.status(201).json({
      message: "Project submitted successfully! It will be visible to advisers of your strand/department once assigned.",
      project
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Submit project error:", error);
    return res.status(500).json({
      message: "Something went wrong on our server. Please try again later.",
      error: error.message
    });
  }
};

exports.getHeadAdminNotifications = async (req, res) => {
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
    if (!isEligibleResearchStudent(req.user)) {
      return res.status(403).json({
        message: "Notifications are only available to eligible research students.",
      });
    }

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
    if (!isEligibleResearchStudent(req.user)) {
      return res.status(403).json({
        message: "Notifications are only available to eligible research students.",
      });
    }

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
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'submitter' }]
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "pending") return res.status(400).json({ message: "Project is not pending" });

    await project.update({
      status: "endorsed",
      last_updated_by_role: req.user.role
    });

    const io = req.app.get("io");

    // 1. Notify eligible research student
    if (isEligibleResearchStudent(project.submitter)) {
      await Notification.create({
        projectId: project.id,
        studentId: project.submitted_by,
        isRead: false,
        reason: `Your project "${project.title}" was endorsed for admin's approval.`,
      });
      if (io) {
        io.emit(`student_notify_${project.submitted_by}`, {
          type: "status_update",
          projectId: project.id,
          title: project.title,
          newStatus: "endorsed"
        });
      }
    }

    // 2. Notify ALL advisers in the same strand/department (including self)
    const advisers = await User.findAll({
      where: {
        role: "research_adviser",
        [Op.or]: [
          project.department_id ? { department_id: project.department_id } : {},
          project.strand_id ? { strand_id: project.strand_id } : {}
        ]
      }
    });

    for (const adv of advisers) {
      await Notification.create({
        projectId: project.id,
        adviserId: adv.id,
        isRead: false,
        reason: `You endorsed the "${project.title}" project — now awaiting admin approval.`
      });

      if (io) {
        io.emit(`adviser_notify_${adv.id}`, {
          type: "status_update",
          projectId: project.id,
          title: project.title,
          student: project.submitter?.full_name,
          newStatus: "endorsed",
          updatedBy: req.user.full_name,
          time: new Date().toLocaleString()
        });
      }
    }

    // 3. Notify head admins
    const headAdmins = await User.findAll({ where: { role: "head_admin" } });
    for (const head of headAdmins) {
      await Notification.create({
        projectId: project.id,
        adminId: head.id,
        isRead: false,
        reason: `Project "${project.title}" was endorsed by research adviser "${req.user.full_name}".`
      });

      // ADD THIS BLOCK BELOW TO FIX REAL-TIME UPDATES FOR HEAD ADMIN
      if (io) {
        io.emit(`admin_notify_${head.id}`, {
          type: "new_pending",
          projectId: project.id,
          title: project.title,
          message: `New endorsed project from ${req.user.full_name}`
        });
      }
    }

    emitWorkflowRefresh(io, ["student", "research_adviser", "head_admin"]);

    res.json({
      message: "Project endorsed to admin for approval.",
      project: await project.reload(),
    });
  } catch (error) {
    console.error("Endorse project error:", error);
    res.status(500).json({ message: "Failed to endorse project.", error: error.message });
  }
};

// Adviser or Head Admin requests revision
exports.needRevision = async (req, res) => {
  try {
    const user = req.user;
    const { reason } = req.body;
    const { id } = req.params;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Revision reason is required." });
    }

    const project = await Project.findByPk(id, {
      include: [{ model: User, as: "submitter" }],
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const io = req.app.get("io");

    // Head Admin: endorsed → admin_revision (student NOT notified yet)
    if (user.role === "head_admin" || user.role === "admin") {
      if (project.status !== PROJECT_STATUS.ENDORSED) {
        return res.status(400).json({
          message: "Only endorsed projects can be sent back for admin revision.",
          currentStatus: project.status,
        });
      }

      await project.update({
        status: PROJECT_STATUS.ADMIN_REVISION,
        rejection_reason: reason,
        last_updated_by_role: user.role,
      });

      await notifyProjectAdvisers(
        io,
        project,
        `Project "${project.title}" requires revision from Head Admin. Reason: ${reason}`,
        { newStatus: PROJECT_STATUS.ADMIN_REVISION, reason, updatedBy: user.full_name }
      );

      await notifyHeadAdmins(
        io,
        project,
        `You requested revision for "${project.title}". Reason: ${reason}`,
        { newStatus: PROJECT_STATUS.ADMIN_REVISION, reason, updatedBy: user.full_name }
      );

      emitWorkflowRefresh(io, ["research_adviser", "head_admin"]);

      return res.json({
        message: "Advisers notified for revision.",
        project: await project.reload(),
      });
    }

    // Research Adviser: pending → need_revision (student + advisers notified)
    if (user.role === "research_adviser") {
      if (project.status !== PROJECT_STATUS.PENDING) {
        return res.status(400).json({
          message: "Only pending projects can be marked for adviser revision.",
          currentStatus: project.status,
        });
      }

      await project.update({
        status: PROJECT_STATUS.NEED_REVISION,
        rejection_reason: reason,
        last_updated_by_role: user.role,
      });

      const studentReason = `Your "${project.title}" project requires revision. Reason: ${reason}`;
      await notifyStudent(io, {
        project,
        reason: studentReason,
        payload: {
          type: "status_update",
          projectId: project.id,
          title: project.title,
          newStatus: PROJECT_STATUS.NEED_REVISION,
          reason,
        },
      });

      await notifyProjectAdvisers(
        io,
        project,
        `Project "${project.title}" was marked for revision. Reason: ${reason}`,
        { newStatus: PROJECT_STATUS.NEED_REVISION, reason, updatedBy: user.full_name }
      );

      emitWorkflowRefresh(io, ["student", "research_adviser"]);

      return res.json({
        message: "Student and advisers notified for revision.",
        project: await project.reload(),
      });
    }

    res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("needRevision error:", error);
    res.status(500).json({ message: "Failed to mark as need revision.", error: error.message });
  }
};

// Adviser informs student after Head Admin requested revision (admin_revision → need_revision)
exports.informStudentOfRevision = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.status !== PROJECT_STATUS.ADMIN_REVISION) {
      return res.status(400).json({
        message: "Student can only be informed when project is awaiting adviser action (admin revision).",
        currentStatus: project.status,
      });
    }

    const io = req.app.get("io");
    const adminReason = project.rejection_reason
      ? ` Reason from Head Admin: ${project.rejection_reason}`
      : "";

    await project.update({
      status: PROJECT_STATUS.NEED_REVISION,
      last_updated_by_role: "research_adviser",
    });

    const studentReason = `Your "${project.title}" project requires revision. Please reupload your updated document.${adminReason}`;

    await notifyStudent(io, {
      project,
      reason: studentReason,
      payload: {
        type: "status_update",
        projectId: project.id,
        title: project.title,
        newStatus: PROJECT_STATUS.NEED_REVISION,
        reason: project.rejection_reason,
      },
    });

    await notifyProjectAdvisers(
      io,
      project,
      `Research adviser "${req.user.full_name}" informed the student about revision for "${project.title}".`,
      {
        newStatus: PROJECT_STATUS.NEED_REVISION,
        reason: project.rejection_reason,
        updatedBy: req.user.full_name,
      }
    );

    emitWorkflowRefresh(io, ["student", "research_adviser", "head_admin"]);

    res.json({
      message: "Student notified of revision.",
      project: await project.reload(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reuploadProjectDocument = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.submitted_by !== req.user.id) {
      return res.status(403).json({ message: "Not your project" });
    }
    if (project.status !== PROJECT_STATUS.NEED_REVISION) {
      return res.status(400).json({
        message: "Only projects marked for revision can be reuploaded.",
        currentStatus: project.status,
      });
    }

    const documentUrl = req.file?.path || req.file?.secure_url;
    if (!documentUrl) {
      return res.status(400).json({ message: "Project PDF is required." });
    }

    const io = req.app.get("io");

    await project.update({
      documentPath: documentUrl,
      status: PROJECT_STATUS.PENDING,
      rejection_reason: null,
      last_updated_by_role: "student",
    });

    const studentReason = `Your revised project "${project.title}" was reuploaded and is pending adviser review.`;
    await notifyStudent(io, {
      project,
      reason: studentReason,
      payload: {
        type: "status_update",
        projectId: project.id,
        title: project.title,
        newStatus: PROJECT_STATUS.PENDING,
      },
    });

    await notifyProjectAdvisers(
      io,
      project,
      `Student reuploaded revised project "${project.title}". It is now pending your review.`,
      { newStatus: PROJECT_STATUS.PENDING }
    );

    emitWorkflowRefresh(io, ["student", "research_adviser"]);

    res.json({
      message: "Project reuploaded and set to pending.",
      project: await project.reload(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve project (admin / head admin)
exports.approveProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'submitter' }]
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    await project.update({
      status: "approved",
      last_updated_by_role: req.user.role
    });

    const io = req.app.get("io");

    // Notify ALL advisers in same strand/dept
    const advisers = await User.findAll({
      where: {
        role: "research_adviser",
        [Op.or]: [
          project.department_id ? { department_id: project.department_id } : {},
          project.strand_id ? { strand_id: project.strand_id } : {}
        ]
      }
    });

    for (const adv of advisers) {
      await Notification.create({
        projectId: project.id,
        adviserId: adv.id,
        isRead: false,
        reason: `Project "${project.title}" has been approved and added to the repository!`
      });

      if (io) {
        io.emit(`adviser_notify_${adv.id}`, {
          type: "status_update",
          projectId: project.id,
          title: project.title,
          newStatus: "approved",
          updatedBy: req.user.full_name
        });
      }
    }

    // Notify eligible research student
    if (isEligibleResearchStudent(project.submitter)) {
      await Notification.create({
        projectId: project.id,
        studentId: project.submitted_by,
        isRead: false,
        reason: `Your project "${project.title}" has been approved and added to the repository.`
      });

      if (io) {
        io.emit(`student_notify_${project.submitted_by}`, {
          type: "status_update",
          projectId: project.id,
          title: project.title,
          newStatus: "approved"
        });
      }
    }

    // Notify ALL head admins (including self) about the approval
    const headAdmins = await User.findAll({ where: { role: "head_admin" } });
    for (const head of headAdmins) {
      await Notification.create({
        projectId: project.id,
        adminId: head.id,
        isRead: false,
        reason: `You approved the "${project.title}" project and added to the repository.`
      });

      if (io) {
        io.emit(`admin_notify_${head.id}`, {
          type: "status_update",
          projectId: project.id,
          title: project.title,
          newStatus: "approved",
          updatedBy: req.user.full_name,
          time: new Date().toLocaleString()
        });
      }
    }

    emitWorkflowRefresh(io, ["student", "research_adviser", "head_admin"]);

    res.status(200).json({
      message: "Research project approved",
      project: await project.reload(),
    });
  } catch (error) {
    console.error("Approve project error:", error);
    res.status(500).json({ message: "Failed to approve project.", error: error.message });
  }
};

exports.getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "submitter", attributes: ["id", "full_name", "username", "email", "department", "year_level", "strand", "grade_level"] }
      ]
    });

    // For each project, count all comments (including replies)
    const projectIds = projects.map(p => p.id);
    const commentCountsRaw = await Comment.findAll({
      attributes: [
        "projectId",
        [require("sequelize").fn("COUNT", require("sequelize").col("id")), "count"]
      ],
      where: { projectId: projectIds },
      group: ["projectId"]
    });
    // Map: { projectId: count }
    const commentCounts = {};
    commentCountsRaw.forEach(row => {
      commentCounts[row.projectId] = parseInt(row.get("count"), 10);
    });

    // Attach comment_count to each project
    const projectsWithCounts = projects.map(p => {
      const proj = p.toJSON();
      proj.comment_count = commentCounts[p.id] || 0;
      return proj;
    });
    res.json(projectsWithCounts);
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
    const projectId = parseInt(req.params.id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    // Find the project to get documentPath
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete related comments first (to satisfy FK constraint)
    await Comment.destroy({ where: { projectId } });

    // Delete notifications
    await Notification.destroy({ where: { projectId } });

    // Delete Cloudinary file
    if (project.documentPath) {
      const publicId = project.documentPath.split("/").pop().split(".")[0]; // Extract public_id
      await cloudinary.uploader.destroy(`researchhub_projects/${publicId}`);
    }

    // Delete project
    await Project.destroy({ where: { id: projectId } });

    res.status(200).json({ message: "Research project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: error.message });
  }
};
