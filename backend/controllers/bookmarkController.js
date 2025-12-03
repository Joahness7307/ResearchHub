const { Bookmark, Project } = require("../models");

exports.addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = parseInt(req.params.projectId);
    if (!projectId) return res.status(400).json({ message: "Project ID required" });
    // Prevent duplicate
    const [bookmark, created] = await Bookmark.findOrCreate({
      where: { userId, projectId },
      defaults: { userId, projectId }
    });
    if (!created) return res.status(200).json({ message: "Already bookmarked", bookmark });
    return res.status(201).json({ message: "Bookmarked", bookmark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = parseInt(req.params.projectId);
    if (!projectId) return res.status(400).json({ message: "Project ID required" });
    const deleted = await Bookmark.destroy({ where: { userId, projectId } });
    if (!deleted) return res.status(404).json({ message: "Bookmark not found" });
    return res.status(200).json({ message: "Bookmark removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [{
        model: Project,
        as: "project",
        required: true             // ← Only return bookmarks with existing, non-deleted projects
      }],
      order: [["createdAt", "DESC"]]
    });

    // Now safe — no nulls
    const projects = bookmarks.map(b => b.project);

    res.json(projects);
  } catch (error) {
    console.error("getUserBookmarks error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.isBookmarked = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = parseInt(req.params.projectId);
    if (!projectId) return res.status(400).json({ message: "Project ID required" });
    const bookmark = await Bookmark.findOne({ where: { userId, projectId } });
    res.json({ bookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
