const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    addedAt: { 
      type: Date, 
      default: Date.now 
    },
    notified: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for efficient queries
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ 'items.productId': 1 });

// Update the updatedAt field before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent duplicate products in wishlist
wishlistSchema.methods.addProduct = function(productId) {
  const existingItem = this.items.find(
    item => item.productId.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.items.push({ productId, addedAt: Date.now() });
    return true;
  }
  return false;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);

