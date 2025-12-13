const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

// Protected routes (require authentication)
router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getUserOrders);
router.get('/:orderId', auth, orderController.getOrderById);
router.get('/number/:orderNumber', auth, orderController.getOrderByNumber);

// Admin routes
router.put('/:orderId/status', auth, admin, orderController.updateOrderStatus);

module.exports = router;

