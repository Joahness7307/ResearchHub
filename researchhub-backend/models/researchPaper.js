// module.exports = (sequelize, DataTypes) => {
//   const ResearchPaper = sequelize.define(
//     "ResearchPaper",
//     {
//       id: {
//         type: DataTypes.UUID, // Use UUID
//         defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
//         allowNull: false,
//         primaryKey: true,
//       },
//       title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       abstract: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       fileUrl: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       status: {
//         type: DataTypes.ENUM("pending", "under review", "approved", "rejected"),
//         defaultValue: "pending",
//         validate: {
//           isIn: [["pending", "under review", "approved", "rejected"]],
//         },
//       },
//       submittedBy: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//         onUpdate: "CASCADE",
//         onDelete: "CASCADE",
//       },
//     },
//     {
//       timestamps: true,
//     }
//   );

//   ResearchPaper.associate = (models) => {
//     ResearchPaper.belongsTo(models.User, { foreignKey: "submittedBy", as: "student" });
//     ResearchPaper.hasMany(models.Review, { foreignKey: "paperId", as: "reviews" });
//   };

//   return ResearchPaper;
// };
