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

  const advisers = await User.findAll({
  where: {
    role: "research_adviser",
    [Op.or]: orConditions,
    },
  });

  return [...new Map(advisers.map(a => [a.id, a])).values()];
}

async function getResearchCoordinators() {
  return User.findAll({ where: { role: "research_coordinator" } });
}

async function createNotification({ projectId, studentId, adviserId, researchCoordinatorId, reason }) {
  return Notification.create({
    projectId,
    studentId: studentId ?? null,
    adviserId: adviserId ?? null,
    researchCoordinatorId: researchCoordinatorId ?? null,
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

function emitResearchCoordinator(io, coordinatorId, payload) {
  if (io && coordinatorId) {
    io.emit(`research_coordinator_notify_${coordinatorId}`, payload);
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
 * Notify all research coordinators (DB + socket).
 */
async function notifyResearchCoordinators(io, project, reason, payloadExtra = {}) {
  const coordinators = await getResearchCoordinators();
  for (const coordinator of coordinators) {
    await createNotification({
      projectId: project.id,
      researchCoordinatorId: coordinator.id,
      reason,
    });
    emitResearchCoordinator(io, coordinator.id, {
      type: "status_update",
      projectId: project.id,
      title: project.title,
      message: reason,
      ...payloadExtra,
    });
  }
  return coordinators;
}

/**
 * Broadcast workflow change so dashboards refetch without navigation.
 */
function emitWorkflowRefresh(io, roles = []) {
  if (!io) return;
  const payload = { type: "workflow_refresh", at: Date.now() };
  if (roles.includes("student")) io.emit("workflow_refresh_student", payload);
  if (roles.includes("research_adviser")) io.emit("workflow_refresh_adviser", payload);
  if (roles.includes("research_coordinator")) io.emit("workflow_refresh_research_coordinator", payload);
  if (roles.includes("admin")) io.emit("workflow_refresh_admin", payload);
}

module.exports = {
  PROJECT_STATUS,
  getAdvisersForProject,
  getResearchCoordinators,
  createNotification,
  notifyStudent,
  notifyProjectAdvisers,
  notifyResearchCoordinators,
  emitStudent,
  emitAdviser,
  emitResearchCoordinator,
  emitWorkflowRefresh,
};
