'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='projectId'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "projectId" TO "project_id";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='studentId'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "studentId" TO "student_id";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='adviserId'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "adviserId" TO "research_adviser_id";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='researchCoordinatorId'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "researchCoordinatorId" TO "research_coordinator_id";
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
          WHERE table_name='Notifications' AND column_name='project_id'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "project_id" TO "projectId";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='student_id'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "student_id" TO "studentId";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='research_adviser_id'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "research_adviser_id" TO "adviserId";
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Notifications' AND column_name='research_coordinator_id'
        ) THEN
          ALTER TABLE "Notifications"
          RENAME COLUMN "research_coordinator_id" TO "researchCoordinatorId";
        END IF;

      END $$;
    `);
  }
};