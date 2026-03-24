'use strict';
module.exports = (sequelize, DataTypes) => {
  const Strand = sequelize.define('Strand', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'Strands', timestamps: false });

  Strand.associate = (models) => {
    Strand.hasMany(models.User, { foreignKey: 'strand_id', onDelete: 'SET NULL' });
  };

  return Strand;
};