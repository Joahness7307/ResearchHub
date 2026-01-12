'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Departments table
    await queryInterface.createTable('Departments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      has_blocks: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_majors: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // Blocks table
    await queryInterface.createTable('Blocks', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(10), allowNull: false },
      department_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Departments', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('Blocks', {
      fields: ['name', 'department_id'],
      type: 'unique',
      name: 'unique_block_per_department'
    });

    // Majors table
    await queryInterface.createTable('Majors', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      department_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Departments', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('Majors', {
      fields: ['name', 'department_id'],
      type: 'unique',
      name: 'unique_major_per_department'
    });

    // Strands table (standalone, not tied to department)
    await queryInterface.createTable('Strands', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Blocks');
    await queryInterface.dropTable('Majors');
    await queryInterface.dropTable('Strands');
    await queryInterface.dropTable('Departments');
  }
};