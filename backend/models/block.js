'use strict';
module.exports = (sequelize, DataTypes) => {
  const Block = sequelize.define('Block', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    department_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'Blocks', timestamps: false });

  Block.associate = (models) => {
    Block.belongsTo(models.Department, { foreignKey: 'department_id' });
    Block.hasMany(models.User, { foreignKey: 'block_id', onDelete: 'SET NULL' });
  };

  return Block;
};