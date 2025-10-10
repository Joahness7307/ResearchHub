module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invitations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      username: { type: Sequelize.STRING, allowNull: true, unique: true },
      token: { type: Sequelize.STRING, allowNull: false, unique: true },
      role: { type: Sequelize.ENUM('admin', 'head_admin', 'research_adviser'), allowNull: false },
      type: { type: Sequelize.ENUM('college', 'senior_high'), allowNull: true },
      department: { type: Sequelize.ENUM('BSIT', 'BSHM', 'BEED', 'BSED', 'BPED', 'BSENTREP'), allowNull: true },
      strand: { type: Sequelize.ENUM('ABM', 'STEM', 'TVL', 'HUMSS'), allowNull: true },
      used: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Invitations');
  }
};