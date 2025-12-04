const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Public
router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// Admin only
router.post('/', auth, admin, productController.createProduct);
router.put('/:id', auth, admin, productController.updateProduct);
router.delete('/:id', auth, admin, productController.deleteProduct);

module.exports = router;
