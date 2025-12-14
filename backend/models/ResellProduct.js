const mongoose = require('mongoose');

const resellProductSchema = new mongoose.Schema({
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['shirts', 'pants', 'blazers'], required: true },
  type: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL'], required: true },
  images: [{ type: String, required: true }],
  description: { type: String },
  condition: { 
    type: String, 
    enum: ['Like New', 'Excellent', 'Good', 'Fair'], 
    required: true 
  },
  fabricType: { type: String },
  originalPrice: { type: Number },
  purchaseDate: { type: Date },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'pending'], 
    default: 'available' 
  },
  soldTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  soldAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

resellProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ResellProduct', resellProductSchema);

