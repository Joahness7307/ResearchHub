'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    title_description: { type: DataTypes.STRING, allowNull: false },
    abstract: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    documentPath: { type: DataTypes.STRING, allowNull: false, field: 'document_path' },
    authors: { type: DataTypes.STRING, allowNull: false },
    submitted_by: { type: DataTypes.INTEGER, allowNull: false },
    research_adviser_id: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'endorsed', 'approved', 'need_revision', 'coordinator_revision'), defaultValue: 'pending', allowNull: false },
    last_updated_by_role: { type: DataTypes.STRING, allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    strand_id: { type: DataTypes.INTEGER, allowNull: true },
    assigned_research_adviser_id: { type: DataTypes.INTEGER, allowNull: true },
    claimed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'Projects',
    timestamps: false // If you use custom created_at/updated_at
  });
  Project.associate = function(models) {
    Project.belongsTo(models.User, { foreignKey: 'submitted_by', as: 'submitter' });
    Project.belongsTo(models.User, { foreignKey: 'assigned_research_adviser_id', as: 'assignedResearchAdviser' });
    // Add other associations if needed
  };
  return Project;
};