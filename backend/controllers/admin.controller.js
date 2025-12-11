const User = require('../models/User');
const Product = require('../models/Product');

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ban/Unban user
exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent banning admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }
    
    user.banned = !user.banned;
    await user.save();
    
    res.json({ 
      message: user.banned ? 'User banned successfully' : 'User unbanned successfully',
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        banned: user.banned
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products (admin view with full details)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product price
exports.updateProductPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      { price: Number(price) },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ 
      message: 'Price updated successfully',
      product 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

