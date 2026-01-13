'use strict';
module.exports = (sequelize, DataTypes) => {
  const Major = sequelize.define('Major', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    department_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'Majors', timestamps: false });

  Major.associate = (models) => {
    Major.belongsTo(models.Department, { foreignKey: 'department_id' });
    Major.hasMany(models.User, { foreignKey: 'major_id', onDelete: 'SET NULL' });
  };

  return Major;
};