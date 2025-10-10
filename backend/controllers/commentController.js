const { Comment, User } = require("../models");

exports.addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    const { projectId } = req.params;
    if (!content) return res.status(400).json({ message: "Comment content is required." });
    const comment = await Comment.create({
      projectId,
      userId: req.user.id,
      content,
      parentId: parentId || null // <-- Add this line
    });
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'full_name', 'role'] });
    res.status(201).json({ ...comment.toJSON(), user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const comments = await Comment.findAll({
      where: { projectId, parentId: null }, // Only top-level comments
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'role'] },
        { model: Comment, as: 'replies', include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'role'] }] }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};