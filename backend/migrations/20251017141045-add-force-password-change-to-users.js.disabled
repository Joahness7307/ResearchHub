'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change column default to false (keeps existing values)
    await queryInterface.changeColumn('Users', 'force_password_change', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to previous default true (if needed)
    await queryInterface.changeColumn('Users', 'force_password_change', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  }
};