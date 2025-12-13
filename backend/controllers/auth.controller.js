const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to sign JWT
const toToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, username, phone, password } = req.body;
    
    // Validate required fields
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if phone already exists
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const user = new User({ name, username, phone, password });
    await user.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    
    // Validate input - must provide either username or phone, and password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (!username && !phone) {
      return res.status(400).json({ message: 'Username or phone number is required' });
    }

    // Find user by username or phone
    let user;
    if (username) {
      user = await User.findOne({ username });
    } else {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.banned) {
      return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
    }

    // Compare password using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token and return user data
    const token = toToken(user);
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.logout = async (_req, res) => {
  // For JWT, logout is frontend-based (token removed from client)
  // In a stateless JWT system, logout is handled by removing the token from client storage
  res.status(200).json({ message: 'Logout successful' });
};

// Verify token endpoint - useful for checking if user session is still valid
exports.verifyToken = async (req, res) => {
  try {
    // This middleware already verifies the token, so if we reach here, token is valid
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.banned) {
      return res.status(403).json({ message: 'Account has been banned' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
