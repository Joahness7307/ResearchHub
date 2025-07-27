// backend/migrations/XXXXXXXXXXXXXX-add-studentId-to-notifications.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Notifications', 'studentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Notifications', 'studentId');
  }
};