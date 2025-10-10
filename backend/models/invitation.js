module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: true, unique: true },
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    role: { type: DataTypes.ENUM("admin", "head_admin", "research_adviser"), allowNull: false },
    type: { type: DataTypes.ENUM("college", "senior_high"), allowNull: true },
    department: { type: DataTypes.ENUM("BSIT", "BSHM", "BEED", "BSED", "BPED", "BSENTREP"), allowNull: true },
    strand: { type: DataTypes.ENUM("ABM", "STEM", "TVL", "HUMSS"), allowNull: true },
    used: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'Invitations',
    timestamps: true
  });

  Invitation.associate = function(models) {
    // Define associations here if needed
  };

  return Invitation;
};