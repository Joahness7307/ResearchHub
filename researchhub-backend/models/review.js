module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    paperId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ResearchPapers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("approved", "rejected"),
      allowNull: false,
    },
  });

  Review.associate = (models) => {
    Review.belongsTo(models.ResearchPaper, { foreignKey: "paperId" });
    Review.belongsTo(models.User, { foreignKey: "reviewerId" });
  };

  return Review;
};
