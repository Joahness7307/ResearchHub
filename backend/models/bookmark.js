module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: false }
  }, {});
  Bookmark.associate = function(models) {
    Bookmark.belongsTo(models.User, { foreignKey: 'userId' });
    Bookmark.belongsTo(models.Project, { foreignKey: 'projectId' });
  };
  return Bookmark;
};