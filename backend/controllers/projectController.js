const { Project, User, Notification, Comment, sequelize } = require("../models");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const { Op } = require("sequelize");
const axios = require("axios");
const {
  PROJECT_STATUS,
  NOTIFICATION_EVENT,
  notifyStudent,
  notifyProjectResearchAdvisers,
  notifyResearchCoordinators,
  emitWorkflowRefresh,
} = require("../services/notificationService");
const { isEligibleResearchStudent } = require("../utils/studentEligibility");
const { getRelevantResearchAdvisers, isAdviserRelevant } = require("../utils/researchAdviser");
const { serializeProjectForRole } = require("../utils/projectSerializer");
const { validateTransition, canTransition } = require("../services/workflowService");

function validateResearchAdviserAccess(project, adviser) {

  const departmentMatch =
    project.department_id &&
    adviser.department_id &&
    project.department_id === adviser.department_id;

  const strandMatch =
    project.strand_id &&
    adviser.strand_id &&
    project.strand_id === adviser.strand_id;

  return departmentMatch || strandMatch;
}

// Upload final research paper
exports.submitProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;

    const io = req.app.get("io");

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

    const document_url = req.file?.path || req.file?.secure_url;

    console.log("📄 Uploaded PDF URL:", document_url);

    // Validate required fields
    if (!title || !title_description || !abstract || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Project PDF is required." });
    }

    const project = await Project.create({
      title,
      title_description,
      abstract,
      category,
      documentPath: document_url,
      authors: user.full_name || user.username || "Unknown",
      submitted_by: user.id,

      // ── These two new fields are very important ──
      department_id: user.department_id || null,
      strand_id: user.strand_id || null,

      // No research adviser yet → will be assigned later when research adviser claims/endorses
      research_adviser_id: null,
      status: "pending"
    }, { transaction: transaction });

    // ── Student notification
    await notifyStudent(io, {
      transaction,
      project,
      event_type: NOTIFICATION_EVENT.SUBMITTED,
      message: `You submitted the project "${project.title}".`,
      payload: {
        newStatus: PROJECT_STATUS.PENDING,
      },
    });

    // Notify research advisers in the same department/strand inside transaction only once
    if (user.department_id || user.strand_id) {

      await notifyProjectResearchAdvisers(io, {
        transaction,
        project,
        event_type: NOTIFICATION_EVENT.SUBMITTED,
        message: `New pending project "${project.title}" submitted by ${user.full_name}.`,
        payload: {
          newStatus: PROJECT_STATUS.PENDING,
        },
      });

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

    await emitWorkflowRefresh(io, [
      "student",
      "research_adviser",
    ], project);

    // Success response
    res.status(201).json({
      message: "Project submitted successfully!",
      project
    });

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }
    
    console.error("Submit project error:", error);
    return res.status(500).json({
      message: "Something went wrong on our server. Please try again later.",
      error: error.message
    });
  }
};

// Get all approved projects counts (for public repository)
exports.getPublicProjectCounts = async (req, res) => {
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
};

// Get total project counts grouped by status (for Admin Dashboard)
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

    // Combine 'need_revision', 'coordinator_revision', and potentially 'rejected' into 'revision'
    const revisionCount = 
      (countMap['need_revision'] || 0) + 
      (countMap['coordinator_revision'] || 0) +
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
      include: [
        { model: User, as: "submitter", attributes: ["id", "full_name", "email", "role"] },
        { model: User, as: "assignedResearchAdviser", attributes: ["id", "full_name", "email"] }
      ]
    });
    res.json(projects);
  } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.getSingleProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: "submitter", attributes: ["id", "full_name", "email", "role"] },
        { model: User, as: "assignedResearchAdviser", attributes: ["id", "full_name", "email"] }
      ]
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Build response payload for clients — always return project data but include
    // assignment metadata so the frontend can render a read-only view for non-assigned advisers.
    const data = serializeProjectForRole(project, req.user?.role);

    // Attach assignment metadata for client-side UI decisions
    data.assigned_research_adviser_id = project.assigned_research_adviser_id || null;
    data.claimed_at = project.claimed_at || null;
    data.assignedResearchAdviser = project.assignedResearchAdviser ? project.assignedResearchAdviser.toJSON() : null;
    data.current_user_is_owner = !!(req.user && req.user.role === "research_adviser" && project.assigned_research_adviser_id === req.user.id);
    data.current_user_is_restricted_adviser = !!(req.user && req.user.role === "research_adviser" && project.assigned_research_adviser_id && project.assigned_research_adviser_id !== req.user.id);

    return res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all projects for research adviser view (projects in their strand/department)
exports.getResearchAdviserProjects = async (req, res) => {
  try {
    const user = req.user;

    // Build query based on adviser's affiliation
    const where = {
      status: { [Op.in]: ["pending", "approved", "need_revision", "endorsed", "coordinator_revision"] } // add statuses you want visible
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
};

// Claim project - research adviser claims ownership
exports.claimProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const adviser = req.user;
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Project not found" });
    }

    // Prevent double-claim
    if (project.assigned_research_adviser_id) {
      await transaction.rollback();
      return res.status(409).json({ message: "Project already claimed" });
    }

    // Validate adviser eligibility for this project
    const relevant = await isAdviserRelevant(project, adviser.id);
    if (!relevant) {
      await transaction.rollback();
      return res.status(403).json({ message: "You are not eligible to claim this project" });
    }

    // Assign ownership
    await project.update(
      {
        assigned_research_adviser_id: adviser.id,
        claimed_at: new Date(),
        last_updated_by_role: adviser.role,
      },
      { transaction }
    );

    const io = req.app.get("io");

    // Resolve previous pending notifications for other advisers on this project
    await Notification.update(
      { isRead: true },
      {
        where: {
          projectId: project.id,
          researchAdviserId: { [Op.ne]: adviser.id },
        },
        transaction,
      }
    );

    // Notify other advisers that this project is assigned
    const otherAdvisers = await getRelevantResearchAdvisers(project);
    const others = otherAdvisers.filter(a => a.id !== adviser.id);

    for (const other of others) {
      await Notification.create(
        {
          projectId: project.id,
          researchAdviserId: other.id,
          message: `Project "${project.title}" has been assigned to ${adviser.full_name}.`,
          event_type: NOTIFICATION_EVENT.ASSIGNED,
          isRead: false,
        },
        { transaction }
      );

      // emit to adviser's socket room to update in real-time (use existing room + event naming)
      try {
        io.to(`research_adviser:${other.id}`).emit(`research_adviser_notify_${other.id}`, {
          type: NOTIFICATION_EVENT.ASSIGNED,
          projectId: project.id,
          title: project.title,
          message: `Project \"${project.title}\" has been assigned to ${adviser.full_name}.`,
          assignedResearchAdviserId: adviser.id,
          assignedResearchAdviserName: adviser.full_name,
        });
      } catch (e) {
        // ignore socket failures
      }
    }

    // Inform the assigned adviser as well (optional notify)
    await Notification.create(
      {
        projectId: project.id,
        researchAdviserId: adviser.id,
        message: `You have claimed project "${project.title}".`,
        event_type: NOTIFICATION_EVENT.ASSIGNED,
        isRead: false,
      },
      { transaction }
    );
      try {
        io.to(`research_adviser:${adviser.id}`).emit(`research_adviser_notify_${adviser.id}`, {
          type: NOTIFICATION_EVENT.ASSIGNED,
          projectId: project.id,
          title: project.title,
          message: `You have claimed project \"${project.title}\".`,
          assignedResearchAdviserId: adviser.id,
          assignedResearchAdviserName: adviser.full_name,
        });
      } catch (e) {}

    await transaction.commit();

    // Broadcast a workflow refresh so dashboards update instantly
    await emitWorkflowRefresh(io, ["research_adviser"], project);

    return res.json({ message: "Project claimed successfully.", project: await project.reload() });
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    console.error("claimProject error:", error);
    return res.status(500).json({ message: "Failed to claim project.", error: error.message });
  }
};

// Download project document (with access control)
exports.downloadProjectDocument = async (req, res) => {
  try {
    // Find the project by ID
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project || !project.documentPath) {
      return res.status(404).json({ message: "Project or document not found" });
    }

    // Stream the PDF from Cloudinary
    const response = await axios.get(project.documentPath, 
      { responseType: "stream"});

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
};

// Research adviser endorses project to research coordinator (pending → endorsed)
exports.endorseProject = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: "submitter" }],
      transaction,
    });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Project not found" });
    }

    // Prevent non-assigned advisers from mutating a claimed project
    if (project.assigned_research_adviser_id && project.assigned_research_adviser_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ message: "This project is assigned to another research adviser." });
    }

    if (!validateResearchAdviserAccess(project, req.user)) {
      await transaction.rollback();

      return res.status(403).json({
        message: "Unauthorized adviser access",
      });
    }

    validateTransition(
      project.status,
      PROJECT_STATUS.ENDORSED
    );

    await project.update(
      {
        status: PROJECT_STATUS.ENDORSED,
        research_adviser_id: req.user.id,
        last_updated_by_role: req.user.role,
      },
      { transaction }
    );

    const io = req.app.get("io");

    // Student notification
    if (isEligibleResearchStudent(project.submitter)) {
      await notifyStudent(io, {
        transaction,
        project,
        event_type: NOTIFICATION_EVENT.ENDORSED,
        message: `Your project "${project.title}" was endorsed for admin approval.`,
        payload: {
          newStatus: PROJECT_STATUS.ENDORSED,
        },
      });
    }

    // Research Adviser notifications
    await notifyProjectResearchAdvisers(io, {
        transaction,
        project,
        event_type: NOTIFICATION_EVENT.ENDORSED,
          message: `Project "${project.title}" was endorsed for admin approval.`,
        payload: {
          newStatus: PROJECT_STATUS.ENDORSED,
        },
      });

    // Coordinator notifications
    await notifyResearchCoordinators(io, {
      transaction,
      project,
      event_type: NOTIFICATION_EVENT.ENDORSED,
      message: `Project "${project.title}" was endorsed by ${req.user.full_name}.`,
      payload: {
        newStatus: PROJECT_STATUS.ENDORSED,
      },
    });

    await transaction.commit();

    await emitWorkflowRefresh(io, [
      "student",
      "research_adviser",
      "research_coordinator"
    ], project);

    return res.json({
      message: "Project endorsed successfully.",
      project: await project.reload(),
    });

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Endorse project error:", error);

    return res.status(500).json({
      message: "Failed to endorse project.",
      error: error.message,
    });
  }
};

// Research Adviser or Research Coordinator requests revision
exports.needRevision = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const user = req.user;
    const { reason } = req.body;
    const { id } = req.params;

    if (!reason || !String(reason).trim()) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Revision reason is required.",
      });
    }

    const project = await Project.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const submitter = await User.findByPk(project.submitted_by, {
      transaction,
    });

    if (!project) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Authorization checks - only apply adviser-specific checks to advisers
    console.debug("[needRevision] user.role=", user.role, "user.id=", user.id);
    console.debug("[needRevision] project.id=", id, "project.status=", project.status, "assigned_research_adviser_id=", project.assigned_research_adviser_id, "research_adviser_id=", project.research_adviser_id);

    if (user.role === "research_adviser") {
      const assignedMismatch = project.assigned_research_adviser_id && project.assigned_research_adviser_id !== user.id;
      const accessAllowed = validateResearchAdviserAccess(project, user);
      console.debug("[needRevision] adviserChecks assignedMismatch=", assignedMismatch, "accessAllowed=", accessAllowed);

      if (assignedMismatch || !accessAllowed) {
        await transaction.rollback();
        console.debug("[needRevision] returning 403 for adviser unauthorized");
        return res.status(403).json({
          message: "Unauthorized adviser access",
        });
      }
    }

    const io = req.app.get("io");

    // =========================================================
    // RESEARCH COORDINATOR
    // endorsed -> coordinator_revision
    // =========================================================
    if (user.role === "research_coordinator") {
      console.debug("[needRevision] research_coordinator attempting coordinator_revision", {
        projectStatus: project.status,
        targetStatus: PROJECT_STATUS.COORDINATOR_REVISION,
        canTransition: canTransition(project.status, PROJECT_STATUS.COORDINATOR_REVISION),
        projectId: project.id,
        coordinatorId: user.id,
        submitterId: submitter?.id,
      });

      validateTransition(project.status, PROJECT_STATUS.COORDINATOR_REVISION);

      await project.update(
        {
          status: PROJECT_STATUS.COORDINATOR_REVISION,
          rejection_reason: reason,
          last_updated_by_role: user.role,
        },
        { transaction }
      );

      // Notify research advisers ONLY
      await notifyProjectResearchAdvisers(io, {
        transaction,
        project,
        event_type: NOTIFICATION_EVENT.REVISION_REQUEST,
        message: `Research Coordinator requested revision for "${project.title}". Reason: ${reason}`,
        payload: {
          newStatus: PROJECT_STATUS.COORDINATOR_REVISION,
        },
      });

      // Notify research coordinators
      await notifyResearchCoordinators(io, {
        transaction,
        project,
        event_type: NOTIFICATION_EVENT.REVISION_REQUEST,
        message: `Revision requested for "${project.title}".`,
        payload: {
          newStatus: PROJECT_STATUS.COORDINATOR_REVISION,
        },
      });

      await transaction.commit();

      await emitWorkflowRefresh(io, ["student", "research_adviser", "research_coordinator"], project);

      return res.json({
        message: "Revision request sent to advisers.",
        project: await project.reload(),
      });
    }

    // =========================================================
    // RESEARCH ADVISER REVISION
    // pending -> need_revision
    // =========================================================
    if (user.role === "research_adviser") {

      validateTransition(
        project.status,
        PROJECT_STATUS.NEED_REVISION
      );

      await project.update(
        {
          status: PROJECT_STATUS.NEED_REVISION,
          rejection_reason: reason,
          research_adviser_id: user.id,
          last_updated_by_role: user.role,
        },
        { transaction }
      );

      // Student notification
      await notifyStudent(io, {
        transaction,
        project,
        event_type: NOTIFICATION_EVENT.REVISION_REQUEST,
        message: `Your project "${project.title}" requires revision. Reason: ${reason}`,
        payload: {
          newStatus: PROJECT_STATUS.NEED_REVISION,
        },
      });

      // Research Adviser notifications
      await notifyProjectResearchAdvisers(io, {
        transaction,
        project,
        event_type: NOTIFICATION_EVENT.REVISION_REQUEST,
        message: `Project "${project.title}" was marked for revision.`,
        payload: {
          newStatus: PROJECT_STATUS.NEED_REVISION,
        },
      });

      await transaction.commit();

      await emitWorkflowRefresh(io, [
        "student",
        "research_adviser",
        "research_coordinator"
      ], project);

      return res.json({
        message: "Project marked for revision.",
        project: await project.reload(),
      });
    }

    await transaction.rollback();

    return res.status(403).json({
      message: "Unauthorized",
    });

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("needRevision error:", error);

    return res.status(500).json({
      message: "Failed to mark project for revision.",
      error: error.message,
    });
  }
};

// Adviser informs student after Research Coordinator requested revision (coordinator_revision → need_revision)
exports.informStudentOfRevision = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {

    const project = await Project.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!project) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (req.user.role !== "research_adviser") {
      await transaction.rollback();

      return res.status(403).json({
        message: "Only research advisers can inform students.",
      });
    }

    if ((project.assigned_research_adviser_id && project.assigned_research_adviser_id !== req.user.id) || !validateResearchAdviserAccess(project, req.user)) {
      await transaction.rollback();

      return res.status(403).json({
        message: "Unauthorized adviser access",
      });
    }

    validateTransition(
      project.status,
      PROJECT_STATUS.NEED_REVISION
    );

    const io = req.app.get("io");

    await project.update(
      {
        status: PROJECT_STATUS.NEED_REVISION,
        research_adviser_id: req.user.id,
        last_updated_by_role: "research_adviser",
      },
      { transaction }
    );

    // Student notification
    await notifyStudent(io, {
      transaction,
      project,
        event_type: NOTIFICATION_EVENT.INFORMED_STUDENT,
        message: `Your project "${project.title}" requires revision. Reason: ${project.rejection_reason}`,
        payload: {
          newStatus: PROJECT_STATUS.NEED_REVISION,
        },
      });

    // Research Adviser notifications
    await notifyProjectResearchAdvisers(io, {
      transaction,
      project,
        event_type: NOTIFICATION_EVENT.INFORMED_STUDENT,
        message: `Student was informed about revision for "${project.title}".`,
        payload: {
          newStatus: PROJECT_STATUS.NEED_REVISION,
        },
      });

    await transaction.commit();

    await emitWorkflowRefresh(io, [
      "student",
      "research_adviser",
      "research_coordinator"
    ], project);

    return res.json({
      message: "Student informed successfully.",
      project: await project.reload(),
    });

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("informStudentOfRevision error:", error);

    return res.status(500).json({
      message: "Failed to inform student.",
      error: error.message,
    });
  }
};

exports.reuploadProjectDocument = async (req, res) => {

  const transaction = await sequelize.transaction();

  try {

    const project = await Project.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!project) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (req.user.role !== "student") {
      await transaction.rollback();

      return res.status(403).json({
        message: "Only students can reupload projects.",
      });
    }

    if (project.submitted_by !== req.user.id) {
      await transaction.rollback();

      return res.status(403).json({
        message: "Not your project",
      });
    }

    validateTransition(
      project.status,
      PROJECT_STATUS.PENDING
    );

    const document_url =
      req.file?.path || req.file?.secure_url;

    if (!document_url) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Project PDF is required.",
      });
    }

    const io = req.app.get("io");

    await project.update(
      {
        documentPath: document_url,
        status: PROJECT_STATUS.PENDING,
        rejection_reason: null,
        last_updated_by_role: "student",
      },
      { transaction }
    );

    // Student notification
    await notifyStudent(io, {
      transaction,
      project,
        event_type: NOTIFICATION_EVENT.REUPLOADED,
        message: `You reuploaded revised project "${project.title}".`,
        payload: {
        newStatus: PROJECT_STATUS.PENDING,
      },
    });

    // Adviser notifications
    await notifyProjectResearchAdvisers(io, {
      transaction,
      project,
      event_type: NOTIFICATION_EVENT.REUPLOADED,
      message: `Student reuploaded revised project "${project.title}".`,
      payload: {
        newStatus: PROJECT_STATUS.PENDING,
      },
    });

    await transaction.commit();

    await emitWorkflowRefresh(io, [
      "student",
      "research_adviser",
      "research_coordinator"
    ], project);

    return res.json({
      message: "Project reuploaded successfully.",
      project: await project.reload(),
    });

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("reuploadProjectDocument error:", error);

    return res.status(500).json({
      message: "Failed to reupload project.",
      error: error.message,
    });
  }
};

// Approve project
exports.approveProject = async (req, res) => {

  const transaction = await sequelize.transaction();

  try {

    const project = await Project.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const submitter = await User.findByPk(project.submitted_by, {
      transaction,
    });

    if (!project) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (
      req.user.role !== "research_coordinator"
    ) {
      await transaction.rollback();

      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    validateTransition(
      project.status,
      PROJECT_STATUS.APPROVED
    );

    await project.update(
      {
        status: PROJECT_STATUS.APPROVED,
        last_updated_by_role: req.user.role,
      },
      { transaction }
    );

    const io = req.app.get("io");

    // Research Advisers
    await notifyProjectResearchAdvisers(io, {
      transaction,
      project,
      event_type: NOTIFICATION_EVENT.APPROVED,
      message: `Project "${project.title}" was approved.`,
      payload: {
        newStatus: PROJECT_STATUS.APPROVED,
      },
    });

    // Student
    await notifyStudent(io, {
      transaction,
      project,
      event_type: NOTIFICATION_EVENT.APPROVED,
      message: `Your project "${project.title}" was approved.`,
      payload: {
        newStatus: PROJECT_STATUS.APPROVED,
      },
    });

    // Coordinators
    await notifyResearchCoordinators(io, {
      transaction,
      project,
      event_type: NOTIFICATION_EVENT.APPROVED,
      message: `Project "${project.title}" was approved.`,
      payload: {
        newStatus: PROJECT_STATUS.APPROVED,
      },
    });

    await transaction.commit();

    await emitWorkflowRefresh(io, [
      "student",
      "research_adviser",
      "research_coordinator"
    ], project);

    return res.status(200).json({
      message: "Project approved successfully.",
      project: await project.reload(),
    });

  } catch (error) {

    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("approveProject error:", error);

    return res.status(500).json({
      message: "Failed to approve project.",
      error: error.message,
    });
  }
};

exports.getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "submitter", attributes: ["id", "full_name", "username", "email", "department_id", "year_level", "strand_id", "grade_level"] }
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