const express = require('express');
const router = express.Router();
const {
  uploadBill,
  getMyBills,
  getAllBills,
  getBillById,
  verifyBill,
} = require('../controllers/billController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const uploadBillMiddleware = require('../middleware/uploadMiddleware');

router.post('/upload', protect, uploadBillMiddleware.single('billImage'), uploadBill);
router.get('/my-bills', protect, getMyBills);
router.get('/', protect, authorizeRoles('ADMIN'), getAllBills);
router.get('/:id', protect, getBillById);
router.put('/:id/verify', protect, authorizeRoles('ADMIN'), verifyBill);

module.exports = router;
