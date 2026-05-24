'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    year_level: { type: DataTypes.ENUM("1st", "2nd", "3rd", "4th"), allowNull: true },
    grade_level: { type: DataTypes.ENUM("11", "12"), allowNull: true },
    role: { type: DataTypes.ENUM("admin", "head_admin", "research_adviser", "student", "guest"), allowNull: false, defaultValue: "guest" },
    force_password_change: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    profile_pic_url: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    block_id: { type: DataTypes.INTEGER, allowNull: true },
    major_id: { type: DataTypes.INTEGER, allowNull: true },
    strand_id: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'Users',
    timestamps: false
  });

  User.associate = (models) => {
    User.belongsTo(models.Department, { foreignKey: 'department_id' });
    User.belongsTo(models.Block, { foreignKey: 'block_id' });
    User.belongsTo(models.Major, { foreignKey: 'major_id' });
    User.belongsTo(models.Strand, { foreignKey: 'strand_id' });
  };

  return User;
};