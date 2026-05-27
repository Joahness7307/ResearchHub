'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Projects', 'documentPath', 'document_path');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Projects', 'document_path', 'documentPath');
  }
};
