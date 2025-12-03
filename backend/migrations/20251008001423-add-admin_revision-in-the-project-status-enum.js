'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the new value to the enum type
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_Projects_status\" ADD VALUE IF NOT EXISTS 'admin_revision';"
    );
  },
  async down(queryInterface, Sequelize) {
    // You cannot remove enum values in Postgres easily, so leave this empty or document it.
  }
};