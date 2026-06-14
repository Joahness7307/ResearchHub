const PROJECT_STATUS = {
  PENDING: "pending",
  ENDORSED: "endorsed",
  APPROVED: "approved",
  NEED_REVISION: "need_revision",
  COORDINATOR_REVISION: "coordinator_revision",
};

const ALLOWED_TRANSITIONS = {
  [PROJECT_STATUS.PENDING]: [
    PROJECT_STATUS.ENDORSED,
    PROJECT_STATUS.NEED_REVISION,
  ],

  [PROJECT_STATUS.NEED_REVISION]: [
    PROJECT_STATUS.PENDING,
  ],

  [PROJECT_STATUS.ENDORSED]: [
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.COORDINATOR_REVISION,
  ],

  [PROJECT_STATUS.COORDINATOR_REVISION]: [
    PROJECT_STATUS.NEED_REVISION,
  ],

  [PROJECT_STATUS.APPROVED]: [],
};

function canTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to);
}

function validateTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid workflow transition from "${from}" to "${to}"`
    );
  }
}

module.exports = {
  PROJECT_STATUS,
  canTransition,
  validateTransition,
};