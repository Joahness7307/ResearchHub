"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename column 'reason' to 'message' in Notifications table
    // Preserve type and nullability
    await queryInterface.renameColumn('Notifications', 'reason', 'message');
  },

  async down(queryInterface, Sequelize) {
    // Revert column name
    await queryInterface.renameColumn('Notifications', 'message', 'reason');
  }
};
