module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: false }
  }, {});
  Like.associate = function(models) {
    Like.belongsTo(models.User, { foreignKey: 'userId' });
    Like.belongsTo(models.Project, { foreignKey: 'projectId' });
  };
  return Like;
};