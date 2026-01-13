'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'department_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Departments', key: 'id' },
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('Users', 'block_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Blocks', key: 'id' },
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('Users', 'major_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Majors', key: 'id' },
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('Users', 'strand_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Strands', key: 'id' },
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'department_id');
    await queryInterface.removeColumn('Users', 'block_id');
    await queryInterface.removeColumn('Users', 'major_id');
    await queryInterface.removeColumn('Users', 'strand_id');
  }
};