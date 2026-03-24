const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { 
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getBlocksByDept, createBlock, updateBlock, deleteBlock,
  getMajorsByDept, createMajor, updateMajor, deleteMajor,
  getStrands, createStrand, updateStrand, deleteStrand
} = require('../controllers/academicController');

// Public routes for signup dropdowns
router.get('/departments', getDepartments);  // Fetch all depts with flags
router.get('/departments/:deptId/blocks', getBlocksByDept);
router.get('/departments/:deptId/majors', getMajorsByDept);
router.get('/strands', getStrands);

// Admin-only CRUD
router.post('/admin/departments', authMiddleware(['admin']), createDepartment);
router.put('/admin/departments/:id', authMiddleware(['admin']), updateDepartment);
router.delete('/admin/departments/:id', authMiddleware(['admin']), deleteDepartment);

router.post('/admin/departments/:deptId/blocks', authMiddleware(['admin']), createBlock);
router.put('/admin/blocks/:id', authMiddleware(['admin']), updateBlock);
router.delete('/admin/blocks/:id', authMiddleware(['admin']), deleteBlock);

router.post('/admin/departments/:deptId/majors', authMiddleware(['admin']), createMajor);
router.put('/admin/majors/:id', authMiddleware(['admin']), updateMajor);
router.delete('/admin/majors/:id', authMiddleware(['admin']), deleteMajor);

router.post('/admin/strands', authMiddleware(['admin']), createStrand);
router.put('/admin/strands/:id', authMiddleware(['admin']), updateStrand);
router.delete('/admin/strands/:id', authMiddleware(['admin']), deleteStrand);

module.exports = router;