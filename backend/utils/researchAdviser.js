const { User } = require("../models");

async function getRelevantResearchAdvisers(project) {
  const where = {
    role: "research_adviser",
  };

  // STRICT MATCHING
  // Prevent unrelated advisers from receiving notifications

  if (project.department_id && project.strand_id) {
    where.department_id = project.department_id;
    where.strand_id = project.strand_id;
  }
  else if (project.department_id) {
    where.department_id = project.department_id;
  }
  else if (project.strand_id) {
    where.strand_id = project.strand_id;
  }

  const researchAdvisers = await User.findAll({ where });

  return researchAdvisers;
}

module.exports = {
  getRelevantResearchAdvisers,
};