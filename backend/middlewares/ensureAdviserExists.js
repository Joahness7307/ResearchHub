const { getRelevantResearchAdvisers } = require("../utils/researchAdviser");

async function ensureAdviserExists(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const projectLike = {
      department_id: user.department_id,
      strand_id: user.strand_id,
    };

    const advisers = await getRelevantResearchAdvisers(projectLike);

    if (!advisers || advisers.length === 0) {
      return res.status(400).json({ message: "No research adviser is currently assigned to your department/strand. Please contact the administrator." });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = ensureAdviserExists;
