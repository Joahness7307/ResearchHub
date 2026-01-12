'use strict';

const deptData = [
  { name: 'BSIT', has_blocks: true, has_majors: false },
  { name: 'BSHM', has_blocks: true, has_majors: false },
  { name: 'BSED', has_blocks: false, has_majors: true },
  { name: 'BEED', has_blocks: false, has_majors: false },
  { name: 'BPED', has_blocks: false, has_majors: false },
  { name: 'BSENTREP', has_blocks: false, has_majors: false },
];

const blockData = {
  BSIT: ['A', 'B', 'C', 'D'],
  BSHM: ['A', 'B', 'C'],
};

const majorData = {
  BSED: ['English', 'Math', 'Science'],
};

const strandData = ['ABM', 'HUMSS', 'STEM', 'TVL'];

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert departments
    const depts = await queryInterface.bulkInsert('Departments', deptData, { returning: ['id', 'name'] });

    const deptMap = {};
    depts.forEach(d => { deptMap[d.name] = d.id; });

    // Insert blocks
    for (const [deptName, blocks] of Object.entries(blockData)) {
      const deptId = deptMap[deptName];
      if (!deptId) continue;
      await queryInterface.bulkInsert('Blocks', blocks.map(name => ({
        name,
        department_id: deptId,
        created_at: new Date(),
        updated_at: new Date()
      })));
    }

    // Insert majors
    for (const [deptName, majors] of Object.entries(majorData)) {
      const deptId = deptMap[deptName];
      if (!deptId) continue;
      await queryInterface.bulkInsert('Majors', majors.map(name => ({
        name,
        department_id: deptId,
        created_at: new Date(),
        updated_at: new Date()
      })));
    }

    // Insert strands
    await queryInterface.bulkInsert('Strands', strandData.map(name => ({
      name,
      created_at: new Date(),
      updated_at: new Date()
    })), {});

    // Now migrate Users table
    const [users] = await queryInterface.sequelize.query('SELECT id, department, block, major, strand FROM "Users"');

    for (const user of users) {
      const updates = {};

      if (user.department) {
        updates.department_id = deptMap[user.department] || null;
      }
      if (user.block && user.department) {
        const [[block]] = await queryInterface.sequelize.query(
          `SELECT id FROM "Blocks" WHERE name = ? AND department_id = ?`,
          { replacements: [user.block, deptMap[user.department]] }
        );
        updates.block_id = block ? block.id : null;
      }
      if (user.major && user.department) {
        const [[major]] = await queryInterface.sequelize.query(
          `SELECT id FROM "Majors" WHERE name = ? AND department_id = ?`,
          { replacements: [user.major, deptMap[user.department]] }
        );
        updates.major_id = major ? major.id : null;
      }
      if (user.strand) {
        const [[strand]] = await queryInterface.sequelize.query(
          `SELECT id FROM "Strands" WHERE name = ?`,
          { replacements: [user.strand] }
        );
        updates.strand_id = strand ? strand.id : null;
      }

      if (Object.keys(updates).length > 0) {
        await queryInterface.sequelize.query(
          `UPDATE "Users" SET ${Object.keys(updates).map(k => `"${k}" = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
          { replacements: [...Object.values(updates), user.id] }
        );
      }
    }
  },

  async down(queryInterface) {
    // For rollback: clear the new tables (users will lose refs but keep old ENUMs)
    await queryInterface.bulkDelete('Blocks', null, {});
    await queryInterface.bulkDelete('Majors', null, {});
    await queryInterface.bulkDelete('Strands', null, {});
    await queryInterface.bulkDelete('Departments', null, {});
    // Reset user refs
    await queryInterface.sequelize.query(`
      UPDATE "Users" SET 
        department_id = NULL, 
        block_id = NULL, 
        major_id = NULL, 
        strand_id = NULL
    `);
  }
};