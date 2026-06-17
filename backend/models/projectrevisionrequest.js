'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProjectRevisionRequest = sequelize.define('ProjectRevisionRequest', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    projectId: { type: DataTypes.INTEGER, allowNull: false, field: 'project_id' },
    requestedByUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'requested_by_user_id' },
    requested_by_role: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('open','resolved'), allowNull: false, defaultValue: 'open' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    resolved_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'ProjectRevisionRequests',
    timestamps: false,
    underscored: true,
  });

  ProjectRevisionRequest.associate = (models) => {
    ProjectRevisionRequest.belongsTo(models.Project, { foreignKey: 'project_id' });
    ProjectRevisionRequest.belongsTo(models.User, { foreignKey: 'requested_by_user_id', as: 'requester' });
  };

  return ProjectRevisionRequest;
};
