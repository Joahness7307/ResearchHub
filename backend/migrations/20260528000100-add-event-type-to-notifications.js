'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'Notifications'
            AND column_name = 'event_type'
        ) THEN
          ALTER TABLE "Notifications"
          ADD COLUMN "event_type" VARCHAR(64);
        END IF;
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'Notifications'
            AND column_name = 'event_type'
        ) THEN
          ALTER TABLE "Notifications"
          DROP COLUMN "event_type";
        END IF;
      END $$;
    `);
  }
};
