'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Notifications', 'adminId', 'researchCoordinatorId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Notifications', 'researchCoordinatorId', 'adminId');
  }
};
