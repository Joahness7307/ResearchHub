const { Comment, User } = require("../models");

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { paperId } = req.params;
    if (!content) return res.status(400).json({ message: "Comment content is required." });
    const comment = await Comment.create({
      paperId,
      userId: req.user.id,
      content
    });
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'name', 'role'] });
    res.status(201).json({ ...comment.toJSON(), user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { paperId } = req.params;
    const comments = await Comment.findAll({
      where: { paperId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};