'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // --- UP: Apply the Migration (Allow NULL, Remove Default) ---
  async up(queryInterface, Sequelize) {
    // Action: Change column to allow NULL and remove the default value.
    // This cleans up the database so that the application/model can handle the default value.
    await queryInterface.changeColumn('Users', 'profile_pic_url', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null // Removes the database-level default
    });
  },

  // --- DOWN: Revert the Migration (Set back to NOT NULL with Original Default) ---
  async down(queryInterface, Sequelize) {
    // Action: Revert the column to the state of the previous migration.
    // This sets the column back to NOT NULL and re-applies the '/images/default-pp.png' default.
    await queryInterface.changeColumn('Users', 'profile_pic_url', {
      type: Sequelize.STRING,
      allowNull: false, // Reverting to NOT NULL
      defaultValue: '/images/default-pp.png' // Reverting to the exact previous default value
    });
  }
};