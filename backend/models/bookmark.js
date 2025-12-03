module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Projects', key: 'id' }
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'projectId']
      }
    ]
  });
  Bookmark.associate = function(models) {
    Bookmark.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Bookmark.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  };
  return Bookmark;
};
module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
  }, {});
  Bookmark.associate = function(models) {
    Bookmark.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Bookmark.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
  };
  return Bookmark;
};
