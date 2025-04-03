// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable("ResearchPapers", {
//       id: {
//         type: Sequelize.UUID,
//         defaultValue: Sequelize.UUIDV4,
//         allowNull: false,
//         primaryKey: true
//       },
//       title: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       abstract: {
//         type: Sequelize.TEXT,
//         allowNull: false
//       },
//       fileUrl: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       status: {
//         type: Sequelize.ENUM("pending", "under review", "approved", "rejected"),
//         defaultValue: "pending",
//         allowNull: false
//       },
//       submittedBy: {
//         type: Sequelize.INTEGER,
//         references: {
//           model: "Users", // Make sure "Users" matches your actual table name
//           key: "id"
//         },
//         onUpdate: "CASCADE",
//         onDelete: "CASCADE"
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
//     await queryInterface.dropTable("research_papers");
//   }
// };