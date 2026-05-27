'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Bookmarks', 'userId', 'user_id');
    await queryInterface.renameColumn('Bookmarks', 'projectId', 'project_id');
    await queryInterface.renameColumn('Bookmarks', 'createdAt', 'created_at');
    await queryInterface.renameColumn('Bookmarks', 'updatedAt', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Bookmarks', 'user_id', 'userId');
    await queryInterface.renameColumn('Bookmarks', 'project_id', 'projectId');
    await queryInterface.renameColumn('Bookmarks', 'created_at', 'createdAt');
    await queryInterface.renameColumn('Bookmarks', 'updated_at', 'updatedAt');
  }
};