const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ResellProduct = require('../models/ResellProduct');
const User = require('../models/User');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
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
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, productType = 'Product' } = req.body;
    
    let product, sellerId = null;
    
    // Validate product exists based on type
    if (productType === 'ResellProduct') {
      product = await ResellProduct.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Resell product not found' });
      }
      
      // Check if user is trying to buy their own item
      if (product.sellerId.toString() === req.user.id) {
        return res.status(400).json({ message: 'You cannot add your own item to cart' });
      }
      
      // Check if item is available
      if (product.status !== 'available') {
        return res.status(400).json({ message: 'This item is no longer available' });
      }
      
      // Validate size matches
      if (product.size !== size) {
        return res.status(400).json({ message: 'Selected size does not match the product size' });
      }
      
      sellerId = product.sellerId;
    } else {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Validate size is available
      if (!product.sizes.includes(size)) {
        return res.status(400).json({ message: 'Selected size is not available for this product' });
      }
      
      // Check availability
      if (product.availability < quantity) {
        return res.status(400).json({ message: 'Insufficient stock available' });
      }
    }
    
    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    // For resell products, quantity is always 1
    if (productType === 'ResellProduct' && quantity !== 1) {
      return res.status(400).json({ message: 'Quantity must be 1 for preowned items' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart with same size and type
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && 
              item.size === size && 
              item.productType === productType
    );
    
    if (existingItemIndex > -1) {
      // For resell products, can't add duplicate
      if (productType === 'ResellProduct') {
        return res.status(400).json({ message: 'This item is already in your cart' });
      }
      
      // Update quantity for regular products
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.availability < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock available' });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        productType,
        quantity,
        size,
        price: product.price,
        sellerId: sellerId
      });
    }
    
    await cart.save();
    
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
    
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // For resell products, quantity must be 1
    if (item.productType === 'ResellProduct' && quantity !== 1) {
      return res.status(400).json({ message: 'Quantity must be 1 for preowned items' });
    }
    
    // Check product availability
    let product;
    if (item.productType === 'ResellProduct') {
      product = await ResellProduct.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Resell product not found' });
      }
      if (product.status !== 'available') {
        return res.status(400).json({ message: 'This item is no longer available' });
      }
    } else {
      product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if (product.availability < quantity) {
        return res.status(400).json({ message: 'Insufficient stock available' });
      }
    }
    
    item.quantity = quantity;
    await cart.save();
    
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
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    
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
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

