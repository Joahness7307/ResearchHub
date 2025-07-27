'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ResearchPaper extends Model {
    static associate(models) {
      ResearchPaper.belongsTo(models.User, { foreignKey: 'submittedBy', as: 'student' });
      ResearchPaper.hasMany(models.Review, { foreignKey: 'paperId', as: 'reviews' });
    }
  }
  ResearchPaper.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    abstract: { type: DataTypes.TEXT, allowNull: false },
    authors: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    documentPath: { type: DataTypes.STRING, allowNull: false },
    submittedBy: {
      type: DataTypes.INTEGER,
      references: { model: 'Users', key: 'id' },
      allowNull: false,
    },
    status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  rejectionReason: {
  type: DataTypes.TEXT,
  allowNull: true,
},
  }, {
    sequelize,
    modelName: 'ResearchPaper',
    tableName: 'ResearchPapers',
    timestamps: true,
  });
  return ResearchPaper;
};