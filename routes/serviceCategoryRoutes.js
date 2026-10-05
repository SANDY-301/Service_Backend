const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  getCategoryProblems,
  createServiceProblem,
} = require('../controllers/serviceCategoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, authorizeRoles('ADMIN'), createCategory);
router.get('/:categoryId/problems', getCategoryProblems);
router.post('/:categoryId/problems', protect, authorizeRoles('ADMIN'), createServiceProblem);

module.exports = router;
