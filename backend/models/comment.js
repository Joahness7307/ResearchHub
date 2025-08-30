// filepath: c:\Users\HOME\Documents\Projects\ResearchHub-Capstone\backend\models\comment.js
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    paperId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {});
  Comment.associate = function(models) {
    Comment.belongsTo(models.UserProfile, { foreignKey: 'user_id', as: 'user' });
    Comment.belongsTo(models.ResearchPaper, { foreignKey: 'paperId', as: 'paper' });
  };
  return Comment;
};