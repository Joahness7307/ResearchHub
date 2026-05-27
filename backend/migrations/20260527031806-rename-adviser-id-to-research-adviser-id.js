'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Projects', 'adviser_id', 'research_adviser_id');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Projects', 'research_adviser_id', 'adviser_id');
  }
};
