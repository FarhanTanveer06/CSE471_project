const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const auth = require('../middlewares/authMiddleware');

// All routes require authentication
router.get('/', auth, wishlistController.getWishlist);
router.post('/', auth, wishlistController.addToWishlist);
router.delete('/product/:productId', auth, wishlistController.removeFromWishlist);
router.get('/check/:productId', auth, wishlistController.checkWishlist);
router.delete('/clear', auth, wishlistController.clearWishlist);
router.get('/discounts', auth, wishlistController.getWishlistDiscounts);
router.put('/notify/:productId', auth, wishlistController.markAsNotified);

module.exports = router;

