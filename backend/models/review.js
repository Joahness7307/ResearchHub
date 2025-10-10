'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Associate with Project
      Review.belongsTo(models.Project, {
        foreignKey: "paperId",
        as: 'Project'
      });
      // Associate with User (reviewer)
      Review.belongsTo(models.User, {
        foreignKey: "reviewerId",
        as: 'reviewer'
      });
    }
  }
  Review.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    paperId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Projects", // <-- Use new table name
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("approved", "rejected"),
      allowNull: false,
      validate: {
        isIn: [["approved", "rejected"]],
      },
    },
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'Reviews',
    timestamps: true,
  });
  return Review;
};