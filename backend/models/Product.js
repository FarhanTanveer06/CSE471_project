const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['shirts', 'pants', 'blazers'], required: true },
  type: { type: String, required: true }, // e.g., "Formal", "Casual", "Semi-formal"
  images: [{ type: String, required: true }], // Array of image URLs
  description: { type: String },
  fabricType: { type: String, required: true }, // e.g., "Cotton", "Polyester", "Wool"
  gsm: { type: Number, required: true }, // Grams per Square Meter
  availability: { type: Number, default: 0, min: 0 }, // Stock count
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
