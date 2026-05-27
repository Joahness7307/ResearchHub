'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='isRead'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "isRead" TO "is_read";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='createdAt'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "createdAt" TO "created_at";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='updatedAt'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "updatedAt" TO "updated_at";
        END IF;

      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='is_read'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "is_read" TO "isRead";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='created_at'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "created_at" TO "createdAt";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='updated_at'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "updated_at" TO "updatedAt";
        END IF;

      END $$;
    `);
  }
};