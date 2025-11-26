module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Projects', 'last_updated_by_role', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Projects', 'last_updated_by_role');
  }
};