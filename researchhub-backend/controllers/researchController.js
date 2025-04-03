// const { ResearchPaper } = require("../models");

// // Submit a research paper
// exports.submitResearch = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "Unauthorized: User not found" });
//     }

//     const { title, abstract, fileUrl } = req.body;
//     const submittedBy = req.user.id; // Get user ID from token

//     // Validate input
//     if (!title || !abstract || !fileUrl) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Create research paper
//     const researchPaper = await ResearchPaper.create({
//       title,
//       abstract,
//       fileUrl,
//       submittedBy,
//     });

//     res.status(201).json({
//       message: "Research paper submitted successfully",
//       researchPaper,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
