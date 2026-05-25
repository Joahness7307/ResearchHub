'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    // Convert ENUM to STRING
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'guest'
    });

  },

  async down(queryInterface, Sequelize) {

    // Revert STRING back to ENUM
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.ENUM(
        'admin',
        'head_admin',
        'research_adviser',
        'student',
        'guest'
      ),
      allowNull: false,
      defaultValue: 'guest'
    });

  }
};