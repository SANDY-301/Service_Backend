const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById, updateCompany } = require('../controllers/companyController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', protect, authorizeRoles('ADMIN'), updateCompany);

module.exports = router;
