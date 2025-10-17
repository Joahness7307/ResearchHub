'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.ENUM("BSIT", "BSHM", "BSENTREP", "BEED", "BSED", "BPED"), allowNull: true },
    year_level: { type: DataTypes.ENUM("1st", "2nd", "3rd", "4th"), allowNull: true },
    block: { type: DataTypes.ENUM("A", "B", "C", "D"), allowNull: true },
    major: { type: DataTypes.ENUM("English", "Math", "Science"), allowNull: true },
    strand: { type: DataTypes.ENUM("ABM", "HUMSS", "STEM", "TVL"), allowNull: true },
    grade_level: { type: DataTypes.ENUM("11", "12"), allowNull: true },
    role: { type: DataTypes.ENUM("admin", "head_admin", "research_adviser", "student", "guest"), allowNull: false, defaultValue: "guest" },
    force_password_change: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiry: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'Users',
    timestamps: false // If you use custom created_at/updated_at
  });
  return User;
};