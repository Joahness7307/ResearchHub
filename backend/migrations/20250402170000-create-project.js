'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Projects', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      title_description: { type: Sequelize.STRING, allowNull: false },
      abstract: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      documentPath: { type: Sequelize.STRING, allowNull: false },
      authors: { type: Sequelize.STRING, allowNull: false },
      submitted_by: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      adviser_id: { type: Sequelize.INTEGER, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'endorsed', 'approved', 'need_revision'),
        defaultValue: 'pending',
        allowNull: false,
      },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Projects');
  }
};