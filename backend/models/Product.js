const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['shirts', 'pants', 'blazers'], required: true },
  type: { type: String, required: true }, // e.g., "Formal", "Casual", "Semi-formal"
  color: { type: String, required: true }, // e.g., "Black", "White", "Navy", "Gray", "Brown"
  sizes: [{ type: String, enum: ['S', 'M', 'L', 'XL', 'XXL'] }], // Array of available sizes
  images: [{ type: String, required: true }], // Array of image URLs
  description: { type: String },
  fabricType: { type: String, required: true }, // e.g., "Cotton", "Polyester", "Wool"
  gsm: { type: Number, required: true }, // Grams per Square Meter
  availability: { type: Number, default: 0, min: 0 }, // Stock count
  featured: { type: Boolean, default: false }, // Featured product flag
  averageRating: { type: Number, min: 0, max: 5 }, // Average rating from reviews
  totalReviews: { type: Number, default: 0, min: 0 }, // Total number of reviews
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
