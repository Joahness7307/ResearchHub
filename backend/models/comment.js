module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    projectId: {
      type: DataTypes.INTEGER,
      field: 'project_id'
    },

    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },

    content: DataTypes.TEXT,

    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id'
    }
  }, {
    tableName: 'Comments',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Comment.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    Comment.belongsTo(models.Comment, { foreignKey: 'parentId', as: 'parent' });
    Comment.hasMany(models.Comment, { foreignKey: 'parentId', as: 'replies' });
  };

  return Comment;
};