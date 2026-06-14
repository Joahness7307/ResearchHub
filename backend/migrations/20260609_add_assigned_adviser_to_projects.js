"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Projects", "assigned_research_adviser_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("Projects", "claimed_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add FK constraint
    await queryInterface.addConstraint("Projects", {
      fields: ["assigned_research_adviser_id"],
      type: "foreign key",
      name: "fk_projects_assigned_research_adviser",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("Projects", "fk_projects_assigned_research_adviser").catch(() => {});
    await queryInterface.removeColumn("Projects", "claimed_at");
    await queryInterface.removeColumn("Projects", "assigned_research_adviser_id");
  },
};
