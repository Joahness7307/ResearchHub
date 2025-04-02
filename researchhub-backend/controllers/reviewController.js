const { Review, ResearchPaper } = require("../models");

// Submit a review (Only Teachers/Admins can review)
exports.submitReview = async (req, res) => {
  try {
    // Check if the user is a teacher or admin
    if (!["teacher", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only teachers or admins can review papers" });
    }

    const { paperId, feedback, status } = req.body;
    const reviewerId = req.user.id; // Get the reviewer ID (teacher/admin)

    // Validate input
    if (!paperId || !feedback || !status) {
      return res.status(400).json({ message: "All fields (paperId, feedback, status) are required" });
    }

    // Validate status value
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "approved" or "rejected"' });
    }

    // Check if the research paper exists
    const researchPaper = await ResearchPaper.findByPk(paperId);
    if (!researchPaper) {
      return res.status(404).json({ message: "Research paper not found" });
    }

    // Ensure the reviewer has not already reviewed this paper
    const [review, created] = await Review.findOrCreate({
      where: { paperId, reviewerId },
      defaults: { feedback, status }
    });

    if (!created) {
      return res.status(409).json({ message: "You have already reviewed this research paper" });
    }

    // If the paper is still pending, update it to "under review"
    if (researchPaper.status === "pending") {
      await researchPaper.update({ status: "under review" });
    }

    // Update research paper status based on review decision
    await researchPaper.update({ status });

    // Send response back
    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error in submitReview:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
