'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      username: { type: Sequelize.STRING, allowNull: false, unique: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      department: { type: Sequelize.ENUM("BSIT", "BSHM", "BSENTREP", "BEED", "BSED", "BPED"), allowNull: true },
      year_level: { type: Sequelize.ENUM("1st", "2nd", "3rd", "4th"), allowNull: true },
      block: { type: Sequelize.ENUM("A", "B", "C", "D"), allowNull: true },
      major: { type: Sequelize.ENUM("English", "Math", "Science"), allowNull: true },
      strand: { type: Sequelize.ENUM("ABM", "HUMSS", "STEM", "TVL"), allowNull: true },
      grade_level: { type: Sequelize.ENUM("11", "12"), allowNull: true },
      role: { type: Sequelize.ENUM("admin", "head_admin", "research_adviser", "student", "guest"), allowNull: false, defaultValue: "guest" },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
    // Drop ENUMs here if needed
  }
};