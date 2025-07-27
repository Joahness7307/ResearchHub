'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ResearchPapers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      abstract: { type: Sequelize.TEXT, allowNull: false },
      authors: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      documentPath: { type: Sequelize.STRING, allowNull: false },
      submittedBy: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        allowNull: false,
        onUpdate: 'CASCADE',  
        onDelete: 'CASCADE',
      },
      status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ResearchPapers');
  }
};