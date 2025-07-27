'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('adminpassword', 10); // Change password as needed
    await queryInterface.bulkInsert('Users', [{
      name: 'Admin User',
      email: 'joahnesscaparas03@gmail.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'joahnesscaparas03@gmail.com' }, {});
  }
};