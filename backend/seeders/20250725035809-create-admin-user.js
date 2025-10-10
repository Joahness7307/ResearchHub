'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('passA@123', 10); // Change password as needed
     await queryInterface.bulkInsert('Users', [{
      full_name: 'Admin User',
      username: 'AdminUser',
      email: 'joahnesnillas@gmail.com',
      password: hashedPassword,
      department: null,        // Required, use any valid value
      year_level: null,            // Required, use any valid value
      block: null,                // Required, use any valid value
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'joahnesnillas@gmail.com' }, {});
  }
};