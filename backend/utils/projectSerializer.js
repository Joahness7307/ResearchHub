const STUDENT_INTERNAL_STATUS_MAP = {
  admin_revision: "endorsed",
};

function serializeProjectForRole(project, role) {
  const data = typeof project.toJSON === "function" ? project.toJSON() : { ...project };

  if (role === "student" && STUDENT_INTERNAL_STATUS_MAP[data.status]) {
    return {
      ...data,
      status: STUDENT_INTERNAL_STATUS_MAP[data.status],
      internal_status: data.status,
      rejection_reason: null,
    };
  }

  return data;
};

module.exports = {
  serializeProjectForRole,
};