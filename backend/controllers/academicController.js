const { Department, Block, Major, Strand, User } = require('../models');

exports.getDepartments = async (req, res) => {
  try {
    const depts = await Department.findAll({
      attributes: ['id', 'name', 'has_blocks', 'has_majors']
    });
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, has_blocks, has_majors } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const dept = await Department.create({ name, has_blocks, has_majors });
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    await dept.update(req.body);
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByPk(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    const userCount = await User.count({ where: { department_id: dept.id } });
    if (userCount > 0) return res.status(400).json({ message: `Cannot delete - ${userCount} users linked` });
    await dept.destroy();
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Blocks (tied to department)
exports.getBlocksByDept = async (req, res) => {
  try {
    const blocks = await Block.findAll({
      where: { department_id: req.params.deptId },
      attributes: ['id', 'name']
    });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBlock = async (req, res) => {
  try {
    const { name } = req.body;
    const deptId = req.params.deptId;
    if (!name) return res.status(400).json({ message: 'Block name required' });
    const block = await Block.create({ name, department_id: deptId });
    res.status(201).json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const block = await Block.findByPk(req.params.id);
    if (!block) return res.status(404).json({ message: 'Block not found' });
    await block.update(req.body); // e.g., { name: "NewName" }
    res.json(block);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    const block = await Block.findByPk(req.params.id);
    if (!block) return res.status(404).json({ message: 'Block not found' });
    const userCount = await User.count({ where: { block_id: block.id } });
    if (userCount > 0) return res.status(400).json({ message: `Cannot delete - ${userCount} users linked` });
    await block.destroy();
    res.json({ message: 'Block deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Majors (tied to department)
exports.getMajorsByDept = async (req, res) => {
  try {
    const majors = await Major.findAll({
      where: { department_id: req.params.deptId },
      attributes: ['id', 'name']
    });
    res.json(majors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMajor = async (req, res) => {
  try {
    const { name } = req.body;
    const deptId = req.params.deptId;
    if (!name) return res.status(400).json({ message: 'Major name required' });
    const major = await Major.create({ name, department_id: deptId });
    res.status(201).json(major);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const major = await Major.findByPk(req.params.id);
    if (!major) return res.status(404).json({ message: 'Major not found' });
    await major.update(req.body); // e.g., { name: "NewMajor" }
    res.json(major);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMajor = async (req, res) => {
  try {
    const major = await Major.findByPk(req.params.id);
    if (!major) return res.status(404).json({ message: 'Major not found' });
    const userCount = await User.count({ where: { major_id: major.id } });
    if (userCount > 0) return res.status(400).json({ message: `Cannot delete - ${userCount} users linked` });
    await major.destroy();
    res.json({ message: 'Major deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Strands (standalone)
exports.getStrands = async (req, res) => {
  try {
    const strands = await Strand.findAll({
      attributes: ['id', 'name']
    });
    res.json(strands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Strand name required' });
    const strand = await Strand.create({ name });
    res.status(201).json(strand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStrand = async (req, res) => {
  try {
    const strand = await Strand.findByPk(req.params.id);
    if (!strand) return res.status(404).json({ message: 'Strand not found' });
    await strand.update(req.body); // e.g., { name: "NewStrand" }
    res.json(strand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStrand = async (req, res) => {
  try {
    const strand = await Strand.findByPk(req.params.id);
    if (!strand) return res.status(404).json({ message: 'Strand not found' });
    const userCount = await User.count({ where: { strand_id: strand.id } });
    if (userCount > 0) return res.status(400).json({ message: `Cannot delete - ${userCount} users linked` });
    await strand.destroy();
    res.json({ message: 'Strand deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};