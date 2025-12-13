const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middlewares/authMiddleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes (require authentication)
router.post('/product/:productId', auth, reviewController.createReview);
router.get('/product/:productId/user', auth, reviewController.getUserReview);
router.put('/:reviewId', auth, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;

