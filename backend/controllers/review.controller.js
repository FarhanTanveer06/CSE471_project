const Review = require('../models/Review');
const Product = require('../models/Product');

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({ message: 'Comment must be less than 1000 characters' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Get user name from database
    const User = require('../models/User');
    const user = await User.findById(userId);
    const userName = user ? user.name : 'Anonymous';

    // Create review
    const review = new Review({
      productId,
      userId,
      rating: parseInt(rating),
      comment: comment.trim(),
      userName
    });

    await review.save();

    // Calculate and update product average rating
    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Validate input
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = parseInt(rating);
    }

    if (comment !== undefined) {
      if (comment.trim().length === 0) {
        return res.status(400).json({ message: 'Comment cannot be empty' });
      }
      if (comment.trim().length > 1000) {
        return res.status(400).json({ message: 'Comment must be less than 1000 characters' });
      }
      review.comment = comment.trim();
    }

    review.updatedAt = Date.now();
    await review.save();

    // Update product average rating
    await updateProductRating(review.productId);

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // Update product average rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's review for a product
exports.getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ productId, userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to update product average rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ productId });
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, { 
        $unset: { averageRating: 1, totalReviews: 1 } 
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    const totalReviews = reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(averageRating),
      totalReviews
    });
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
}

