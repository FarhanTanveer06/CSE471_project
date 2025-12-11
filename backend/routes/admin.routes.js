const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const productController = require('../controllers/product.controller');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// All admin routes require authentication and admin role
router.use(auth);
router.use(admin);

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/ban', adminController.toggleUserBan);

// Product management
router.get('/products', adminController.getAllProductsAdmin);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.patch('/products/:id/price', adminController.updateProductPrice);

module.exports = router;

