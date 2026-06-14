"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new enum value to Postgres enum type if not exists
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_Projects_status\" ADD VALUE IF NOT EXISTS 'coordinator_revision';"
    );

    // Migrate existing records from 'admin_revision' to 'coordinator_revision'
    await queryInterface.sequelize.query(
      "UPDATE \"Projects\" SET status = 'coordinator_revision' WHERE status = 'admin_revision';"
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert any migrated records back to 'admin_revision'
    await queryInterface.sequelize.query(
      "UPDATE \"Projects\" SET status = 'admin_revision' WHERE status = 'coordinator_revision';"
    );

    // NOTE: We do NOT remove the enum value because Postgres does not allow easy removal.
  },
};
