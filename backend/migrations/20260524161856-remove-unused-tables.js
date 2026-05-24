'use strict';

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.dropTable("Invitations");
    await queryInterface.dropTable("Reviews");

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.createTable("Invitations", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable("Reviews", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

  }

};