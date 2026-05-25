module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    projectId: DataTypes.INTEGER,
    researchCoordinatorId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    adviserId: DataTypes.INTEGER,
    isRead: DataTypes.BOOLEAN,
    reason: DataTypes.TEXT,
  }, {});
  Notification.associate = function(models) {
    Notification.belongsTo(models.Project, { foreignKey: 'projectId' });
    Notification.belongsTo(models.User, { foreignKey: 'researchCoordinatorId' });
    Notification.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
    Notification.belongsTo(models.User, { foreignKey: 'adviserId', as: 'adviser' });
  };
  return Notification;
};