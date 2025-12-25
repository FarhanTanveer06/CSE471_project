const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ResellProduct = require('../models/ResellProduct');
const User = require('../models/User');

// Create a new order from cart
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, transactionId, cardDetails, notes } = req.body;

    // Validate payment method
    const validPaymentMethods = ['COD', 'Bkash', 'Nagad', 'Card'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ message: 'Shipping address is incomplete' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Manually populate products based on productType
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      if (item.productType === 'ResellProduct') {
        item.productId = await ResellProduct.findById(item.productId);
        if (item.sellerId) {
          item.sellerId = await User.findById(item.sellerId);
        }
      } else {
        item.productId = await Product.findById(item.productId);
      }
    }

    // Validate stock availability and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      
      if (!product) {
        return res.status(400).json({ message: `Product ${cartItem.productId} no longer exists` });
      }

      const isResellProduct = cartItem.productType === 'ResellProduct';

      if (isResellProduct) {
        // Validate resell product availability
        if (product.status !== 'available') {
          return res.status(400).json({ 
            message: `${product.name} is no longer available` 
          });
        }
      } else {
        // Validate regular product availability
        if (product.availability < cartItem.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.availability}, Requested: ${cartItem.quantity}` 
          });
        }
      }

      const itemPrice = typeof product.price === 'number' ? product.price : Number(product.price);
      if (!itemPrice || Number.isNaN(itemPrice)) {
        return res.status(400).json({ message: `Invalid price for ${product.name}` });
      }

      const itemTotal = itemPrice * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productType: cartItem.productType,
        productName: product.name,
        quantity: cartItem.quantity,
        size: cartItem.size,
        price: itemPrice,
        total: itemTotal,
        sellerId: isResellProduct ? cartItem.sellerId : undefined,
        sellerPaymentStatus: isResellProduct ? 'pending' : undefined
      });
    }

    // Calculate shipping cost (free for orders above certain amount, or fixed fee)
    const shippingCost = subtotal >= 100 ? 0 : 10; // Free shipping for orders above $100
    const totalAmount = subtotal + shippingCost;

    // For digital payments, require transaction ID or card details
    if (paymentMethod === 'Bkash' || paymentMethod === 'Nagad') {
      if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required for mobile banking payments' });
      }
    }
    
    // For card payments, validate card details
    if (paymentMethod === 'Card') {
      if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardHolderName || 
          !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
        return res.status(400).json({ message: 'Card details are required for card payment' });
      }
      
      // Basic card validation
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
        return res.status(400).json({ message: 'Invalid card number' });
      }
      
      if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4 || !/^\d+$/.test(cardDetails.cvv)) {
        return res.status(400).json({ message: 'Invalid CVV' });
      }
      
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(cardDetails.expiryYear);
      const expiryMonth = parseInt(cardDetails.expiryMonth);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        return res.status(400).json({ message: 'Card has expired' });
      }
      
      if (expiryMonth < 1 || expiryMonth > 12) {
        return res.status(400).json({ message: 'Invalid expiry month' });
      }
    }

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      transactionId: transactionId || null,
      cardDetails: paymentMethod === 'Card' ? {
        cardNumber: cardDetails.cardNumber.replace(/\s/g, '').slice(-4), // Store only last 4 digits
        cardHolderName: cardDetails.cardHolderName,
        expiryMonth: cardDetails.expiryMonth,
        expiryYear: cardDetails.expiryYear,
        cvv: '***' // Never store CVV
      } : undefined,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'completed',
      orderStatus: 'pending',
      subtotal,
      shippingCost,
      totalAmount,
      notes: notes || ''
    });

    try {
      await order.save();
    } catch (saveErr) {
      if (saveErr.name === 'ValidationError') {
        const details = Object.values(saveErr.errors).map(e => e.message);
        return res.status(400).json({ message: 'Order validation failed', details });
      }
      throw saveErr;
    }

    // Update product availability and mark resell products as sold
    for (const item of orderItems) {
      if (item.productType === 'ResellProduct') {
        // Mark resell product as sold
        await ResellProduct.findByIdAndUpdate(item.productId, {
          status: 'sold',
          soldTo: userId,
          soldAt: new Date()
        });
      } else {
        // Update regular product availability
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { availability: -item.quantity }
        });
      }
    }

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    // Populate order with product details for response
    await order.populate('items.productId');

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    const isValidation = err?.name === 'ValidationError';
    res.status(isValidation ? 400 : 500).json({ message: err.message || 'Internal Server Error' });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order by order number
exports.getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderNumber }).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'completed', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    await order.populate('items.productId');

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

