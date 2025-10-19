// [timestamp]-add-default-profile-pic.js

'use strict';

// ⚠️ IMPORTANT: Use the exact default URL path you decided on in your model
const DEFAULT_AVATAR_URL = '/images/default_avatar.png'; 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. CRITICAL STEP: Update ALL existing NULL records FIRST.
    // This makes the column safe for the subsequent definition change.
    console.log("Updating existing NULL profile_pic_url values...");
    await queryInterface.sequelize.query(
      `UPDATE "Users" SET profile_pic_url = '${DEFAULT_AVATAR_URL}' WHERE profile_pic_url IS NULL;`
    );
    console.log("Existing NULL values updated successfully.");

    // 2. Now, safely change the column definition to include the NOT NULL constraint 
    // and the default value, as all rows now have a value.
    await queryInterface.changeColumn('Users', 'profile_pic_url', {
      type: Sequelize.STRING,
      allowNull: false, // Enforce NOT NULL
      defaultValue: DEFAULT_AVATAR_URL
    });
    console.log("Column definition updated successfully.");
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column to allow NULLs (and remove the default for new records)
    await queryInterface.changeColumn('Users', 'profile_pic_url', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  }
};