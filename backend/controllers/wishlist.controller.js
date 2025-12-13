const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    let wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add product to wishlist
    wishlist.items.push({ productId, addedAt: Date.now() });
    await wishlist.save();
    await wishlist.populate('items.productId');

    res.status(201).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId
    );
    
    await wishlist.save();
    await wishlist.populate('items.productId');

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if product is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const inWishlist = wishlist.items.some(
      item => item.productId.toString() === productId
    );

    res.json({ inWishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ message: 'Wishlist cleared successfully', wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get products with discounts from wishlist
exports.getWishlistDiscounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    
    if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
      return res.json({ discounts: [] });
    }

    // Get products that have discounts (featured products or special offers)
    // For now, we'll check for featured products as discounts
    const discountedProducts = wishlist.items
      .filter(item => item.productId && item.productId.featured)
      .map(item => ({
        product: item.productId,
        addedAt: item.addedAt,
        notified: item.notified
      }));

    res.json({ discounts: discountedProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark discount as notified
exports.markAsNotified = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const item = wishlist.items.find(
      item => item.productId.toString() === productId
    );

    if (item) {
      item.notified = true;
      await wishlist.save();
    }

    res.json({ message: 'Marked as notified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

