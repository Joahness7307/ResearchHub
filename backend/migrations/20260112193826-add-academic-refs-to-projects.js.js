'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Projects', 'department_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Departments', key: 'id' },
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('Projects', 'strand_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Strands', key: 'id' },
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Projects', 'department_id');
    await queryInterface.removeColumn('Projects', 'strand_id');
  }
};