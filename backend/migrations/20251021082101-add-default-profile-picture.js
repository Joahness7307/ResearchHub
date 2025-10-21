'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // set default value and ensure NOT NULL at DB level
    await queryInterface.changeColumn('Users', 'profile_pic_url', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '/images/default-pp.png'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // revert to allowing null and removing default (adjust if you want different revert)
    await queryInterface.changeColumn('Users', 'profile_pic_url', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  }
};