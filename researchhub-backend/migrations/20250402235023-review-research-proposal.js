// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable("Reviews", {
//       id: {
//         type: Sequelize.UUID,
//         defaultValue: Sequelize.UUIDV4,
//         allowNull: false,
//         primaryKey: true,
//       },
//       paperId: {
//         type: Sequelize.UUID,
//         allowNull: false,
//         references: {
//           model: "ResearchPapers", // Table name in DB
//           key: "id",
//         },
//         onUpdate: "CASCADE",
//         onDelete: "CASCADE",
//       },
//       reviewerId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         references: {
//           model: "Users", // Table name in DB
//           key: "id",
//         },
//         onUpdate: "CASCADE",
//         onDelete: "CASCADE",
//       },
//       feedback: {
//         type: Sequelize.TEXT,
//         allowNull: false,
//       },
//       status: {
//         type: Sequelize.ENUM("approved", "rejected"),
//         allowNull: false,
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//         defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
//       },
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable("Reviews");
//   },
// };
