const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  productName: { type: String, required: true },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  size: { 
    type: String, 
    enum: ['S', 'M', 'L', 'XL', 'XXL'], 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  total: { 
    type: Number, 
    required: true 
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String },
  country: { type: String, default: 'Bangladesh' }
});

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  items: [orderItemSchema],
  shippingAddress: { 
    type: shippingAddressSchema, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'Bkash', 'Nagad', 'Card'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  transactionId: { 
    type: String 
  },
  cardDetails: {
    cardNumber: { type: String },
    cardHolderName: { type: String },
    expiryMonth: { type: String },
    expiryYear: { type: String },
    cvv: { type: String }
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  subtotal: { 
    type: Number, 
    required: true 
  },
  shippingCost: { 
    type: Number, 
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  notes: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);

