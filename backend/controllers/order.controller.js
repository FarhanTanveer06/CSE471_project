const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
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
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock availability and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      
      // Check if product still exists
      if (!product) {
        return res.status(400).json({ message: `Product ${cartItem.productId} no longer exists` });
      }

      // Check stock availability
      if (product.availability < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.availability}, Requested: ${cartItem.quantity}` 
        });
      }

      const itemTotal = cartItem.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: cartItem.quantity,
        size: cartItem.size,
        price: cartItem.price,
        total: itemTotal
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

    await order.save();

    // Update product availability
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { availability: -item.quantity }
      });
    }

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    // Populate order with product details for response
    await order.populate('items.productId');

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: err.message });
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

