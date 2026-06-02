const { Notification, User } = require("../models");
const { Op } = require("sequelize");
const { isEligibleResearchStudent } = require("../utils/studentEligibility");
const { getRelevantResearchAdvisers } = require("../utils/researchAdviser");
const { PROJECT_STATUS } = require("./workflowService");
const { NOTIFICATION_EVENT } = require("../constants/notificationEvents");

async function createNotification({
  transaction,
  projectId,
  studentId,
  researchAdviserId,
  researchCoordinatorId,
  reason,
  event_type,
}) {
  return Notification.create(
    {
      projectId,
      studentId: studentId || null,
      researchAdviserId: researchAdviserId || null,
      researchCoordinatorId: researchCoordinatorId || null,
      reason,
      event_type,
      isRead: false,
    },
    { transaction }
  );
}

function emitStudent(io, studentId, payload) {
  if (!io || !studentId) return;

  io.to(`student:${studentId}`).emit(
    `student_notify_${studentId}`,
    payload
  );
}

function emitResearchAdviser(io, adviserId, payload) {
  if (!io || !adviserId) return;

  io.to(`research_adviser:${adviserId}`).emit(
    `research_adviser_notify_${adviserId}`,
    payload
  );
}

function emitResearchCoordinator(io, coordinatorId, payload) {
  if (!io || !coordinatorId) return;

  io.to(`research_coordinator:${coordinatorId}`).emit(
    `research_coordinator_notify_${coordinatorId}`,
    payload
  );
}

async function notifyStudent(io, {
  transaction = null,
  project,
  reason,
  event_type,
  payload = {},
}) {

  const student = await User.findByPk(project.submitted_by);

  if (!student || !isEligibleResearchStudent(student)) {
    return;
  }

  await createNotification({
    transaction,
    projectId: project.id,
    studentId: student.id,
    reason,
    event_type,
  });

  emitStudent(io, student.id, {
    type: event_type,
    projectId: project.id,
    title: project.title,
    message: reason,
    ...payload,
  });
}

async function notifyProjectResearchAdvisers(io, {
  transaction = null,
  project,
  reason,
  event_type,
  payload = {},
}) {

  const advisers = await getRelevantResearchAdvisers(project);

  for (const adviser of advisers) {

    await createNotification({
      transaction,
      projectId: project.id,
      researchAdviserId: adviser.id,
      reason,
      event_type,
    });

    emitResearchAdviser(io, adviser.id, {
      type: event_type,
      projectId: project.id,
      title: project.title,
      message: reason,
      ...payload,
    });
  }
}

async function notifyResearchCoordinators(io, {
  transaction = null,
  project,
  reason,
  event_type,
  payload = {},
}) {

  const coordinators = await User.findAll({
    where: {
      role: {
        [Op.in]: ["research_coordinator"],
      },
    },
  });

  for (const coordinator of coordinators) {

    await createNotification({
      transaction,
      projectId: project.id,
      researchCoordinatorId: coordinator.id,
      reason,
      event_type,
    });

    emitResearchCoordinator(io, coordinator.id, {
      type: event_type,
      projectId: project.id,
      title: project.title,
      message: reason,
      ...payload,
    });
  }
}

async function emitWorkflowRefresh(io, roles = [], project = null) {
  if (!io) return;

  const payload = {
    type: "workflow_refresh",
    projectId: project?.id || null,
    status: project?.status || null,
    timestamp: Date.now(),
  };

  if (roles.includes("student") && project?.submitted_by) {
    io.to(`student:${project.submitted_by}`).emit("workflow_refresh_student", payload);
  }

  if (roles.includes("research_adviser") && project) {
    const advisers = await getRelevantResearchAdvisers(project);
    advisers.forEach((adviser) => {
      io.to(`research_adviser:${adviser.id}`).emit("workflow_refresh_research_adviser", payload);
    });
  }

  if (roles.includes("research_coordinator")) {
    io.to("role:research_coordinator").emit("workflow_refresh_research_coordinator", payload);
  }

  if (roles.includes("admin")) {
    io.to("role:admin").emit("workflow_refresh_admin", payload);
  }
}

module.exports = {
  PROJECT_STATUS,
  NOTIFICATION_EVENT,
  notifyStudent,
  notifyProjectResearchAdvisers,
  notifyResearchCoordinators,
  emitWorkflowRefresh
};
