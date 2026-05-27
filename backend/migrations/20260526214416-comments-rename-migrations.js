'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Comments', 'projectId', 'project_id');
    await queryInterface.renameColumn('Comments', 'userId', 'user_id');
    await queryInterface.renameColumn('Comments', 'parentId', 'parent_id');
    await queryInterface.renameColumn('Comments', 'createdAt', 'created_at');
    await queryInterface.renameColumn('Comments', 'updatedAt', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Comments', 'project_id', 'projectId');
    await queryInterface.renameColumn('Comments', 'user_id', 'userId');
    await queryInterface.renameColumn('Comments', 'parent_id', 'parentId');
    await queryInterface.renameColumn('Comments', 'created_at', 'createdAt');
    await queryInterface.renameColumn('Comments', 'updated_at', 'updatedAt');
  }
};