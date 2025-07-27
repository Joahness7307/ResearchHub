'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reviews", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      paperId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ResearchPapers", // <-- Correct table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reviewerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("approved", "rejected"),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex('Reviews', ['paperId', 'reviewerId'], {
      unique: true,
      name: 'unique_paper_reviewer',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Reviews', 'unique_paper_reviewer');
    await queryInterface.dropTable("Reviews");
  },
};