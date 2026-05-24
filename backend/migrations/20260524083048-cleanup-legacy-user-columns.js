'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'department');
    await queryInterface.removeColumn('Users', 'block');
    await queryInterface.removeColumn('Users', 'major');
    await queryInterface.removeColumn('Users', 'strand');
    await queryInterface.removeColumn('Users', 'resetToken');
    await queryInterface.removeColumn('Users', 'resetTokenExpiry');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'department', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'block', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'major', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'strand', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'resetToken', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'resetTokenExpiry', { type: Sequelize.DATE, allowNull: true });
  }
};
