'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A User can submit multiple ResearchProposals
      User.hasMany(models.ResearchPaper, {
        foreignKey: 'submittedBy',
        as: 'submittedPaper'
      });
      // A User can be a reviewer for multiple Reviews
      User.hasMany(models.Review, {
        foreignKey: 'reviewerId',
        as: 'reviewsGiven'
      });
    }
  }
  User.init({
    // ADD THIS ID FIELD
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming name is required
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Email should be unique
      validate: {
        isEmail: true, // Basic email format validation
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("student", "admin"),
      allowNull: false,
      defaultValue: "student",
      validate: {
        isIn: [["student", "admin"]], // Validation for enum consistency
      },
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Explicitly set table name to match migration
    timestamps: true, // Assuming you want createdAt and updatedAt columns
  });
  return User;
};