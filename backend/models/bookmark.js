module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: { model: 'Users', key: 'id' }
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'project_id',
      references: { model: 'Projects', key: 'id' }
    }

  }, {
    tableName: 'Bookmarks',

    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    indexes: [
      {
        unique: true,
        fields: ['user_id', 'project_id']
      }
    ]
  });

  Bookmark.associate = function(models) {
    Bookmark.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Bookmark.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
  };

  return Bookmark;
};