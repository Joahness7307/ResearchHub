module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    projectId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    parentId: { type: DataTypes.INTEGER, allowNull: true } // <-- Add this line
  }, {});
  Comment.associate = function(models) {
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Comment.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    Comment.belongsTo(models.Comment, { foreignKey: 'parentId', as: 'parent' }); // <-- Add this line
    Comment.hasMany(models.Comment, { foreignKey: 'parentId', as: 'replies' }); // <-- Add this line
  };
  return Comment;
};