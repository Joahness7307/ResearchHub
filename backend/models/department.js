'use strict';
module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    has_blocks: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_majors: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'Departments', timestamps: false });

  Department.associate = (models) => {
    Department.hasMany(models.Block, { foreignKey: 'department_id', onDelete: 'CASCADE' });
    Department.hasMany(models.Major, { foreignKey: 'department_id', onDelete: 'CASCADE' });
    Department.hasMany(models.User, { foreignKey: 'department_id', onDelete: 'SET NULL' });
  };

  return Department;
};