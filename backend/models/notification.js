module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    projectId: {
      type: DataTypes.INTEGER,
      field: 'project_id'
    },

    researchCoordinatorId: {
      type: DataTypes.INTEGER,
      field: 'research_coordinator_id'
    },

    studentId: {
      type: DataTypes.INTEGER,
      field: 'student_id'
    },

    researchAdviserId: {
      type: DataTypes.INTEGER,
      field: 'research_adviser_id'
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      field: 'is_read'
    },

    message: DataTypes.TEXT,

    event_type: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Notifications',
    timestamps: true,
    underscored: true
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.Project, { foreignKey: 'project_id' });
    Notification.belongsTo(models.User, { foreignKey: 'research_coordinator_id' });
    Notification.belongsTo(models.User, { foreignKey: 'student_id', as: 'student' });
    Notification.belongsTo(models.User, { foreignKey: 'research_adviser_id', as: 'research_adviser' });
  };

  return Notification;
};
