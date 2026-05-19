const { Notification, User } = require("../models");
const { Op } = require("sequelize");
const { isEligibleResearchStudent } = require("../utils/studentEligibility");

/** Canonical project status values (must match models/project.js ENUM) */
const PROJECT_STATUS = {
  PENDING: "pending",
  ENDORSED: "endorsed",
  APPROVED: "approved",
  NEED_REVISION: "need_revision",
  ADMIN_REVISION: "admin_revision",
};

/**
 * Advisers affiliated with the project's department or strand.
 */
async function getAdvisersForProject(project) {
  const orConditions = [];
  if (project.department_id) {
    orConditions.push({ department_id: project.department_id });
  }
  if (project.strand_id) {
    orConditions.push({ strand_id: project.strand_id });
  }
  if (orConditions.length === 0) return [];

  return User.findAll({
    where: {
      role: "research_adviser",
      [Op.or]: orConditions,
    },
  });
}

async function getHeadAdmins() {
  return User.findAll({ where: { role: "head_admin" } });
}

async function createNotification({ projectId, studentId, adviserId, adminId, reason }) {
  return Notification.create({
    projectId,
    studentId: studentId ?? null,
    adviserId: adviserId ?? null,
    adminId: adminId ?? null,
    isRead: false,
    reason,
  });
}

function emitStudent(io, studentId, payload) {
  if (io && studentId) {
    io.emit(`student_notify_${studentId}`, payload);
  }
}

function emitAdviser(io, adviserId, payload) {
  if (io && adviserId) {
    io.emit(`adviser_notify_${adviserId}`, payload);
  }
}

function emitHeadAdmin(io, adminId, payload) {
  if (io && adminId) {
    io.emit(`admin_notify_${adminId}`, payload);
  }
}

/**
 * Notify one student (DB + socket).
 */
async function notifyStudent(io, { project, reason, payload }) {
  if (!project?.submitted_by) return;

  const student = await User.findByPk(project.submitted_by);
  if (!isEligibleResearchStudent(student)) return;

  await createNotification({
    projectId: project.id,
    studentId: project.submitted_by,
    reason,
  });
  emitStudent(io, project.submitted_by, payload || {
    type: "status_update",
    projectId: project.id,
    title: project.title,
    message: reason,
  });
}

/**
 * Notify all advisers for a project (DB + socket per adviser).
 */
async function notifyProjectAdvisers(io, project, reason, payloadExtra = {}) {
  const advisers = await getAdvisersForProject(project);
  for (const adv of advisers) {
    await createNotification({
      projectId: project.id,
      adviserId: adv.id,
      reason,
    });
    emitAdviser(io, adv.id, {
      type: "status_update",
      projectId: project.id,
      title: project.title,
      message: reason,
      ...payloadExtra,
    });
  }
  return advisers;
}

/**
 * Notify all head admins (DB + socket).
 */
async function notifyHeadAdmins(io, project, reason, payloadExtra = {}) {
  const heads = await getHeadAdmins();
  for (const head of heads) {
    await createNotification({
      projectId: project.id,
      adminId: head.id,
      reason,
    });
    emitHeadAdmin(io, head.id, {
      type: "status_update",
      projectId: project.id,
      title: project.title,
      message: reason,
      ...payloadExtra,
    });
  }
  return heads;
}

/**
 * Broadcast workflow change so dashboards refetch without navigation.
 */
function emitWorkflowRefresh(io, roles = []) {
  if (!io) return;
  const payload = { type: "workflow_refresh", at: Date.now() };
  if (roles.includes("student")) io.emit("workflow_refresh_student", payload);
  if (roles.includes("research_adviser")) io.emit("workflow_refresh_adviser", payload);
  if (roles.includes("head_admin")) io.emit("workflow_refresh_head_admin", payload);
  if (roles.includes("admin")) io.emit("workflow_refresh_admin", payload);
}

module.exports = {
  PROJECT_STATUS,
  getAdvisersForProject,
  getHeadAdmins,
  createNotification,
  notifyStudent,
  notifyProjectAdvisers,
  notifyHeadAdmins,
  emitStudent,
  emitAdviser,
  emitHeadAdmin,
  emitWorkflowRefresh,
};
