const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('ADMIN'), createProduct);
router.put('/:id', protect, authorizeRoles('ADMIN'), updateProduct);
router.delete('/:id', protect, authorizeRoles('ADMIN'), deleteProduct);

module.exports = router;
