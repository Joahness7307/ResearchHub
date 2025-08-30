module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    paperId: DataTypes.INTEGER,
    adminId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    isRead: DataTypes.BOOLEAN,
    reason: DataTypes.TEXT,
  }, {});
  Notification.associate = function(models) {
    Notification.belongsTo(models.ResearchPaper, { foreignKey: 'paperId' });
    // Notification.belongsTo(models.User, { foreignKey: 'adminId' });
    // Notification.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
  };
  return Notification;
};