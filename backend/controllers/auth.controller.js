const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to sign JWT
toToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.signup = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ name, phone, password });
    await user.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = toToken(user);
    res.status(200).json({ token, user: { name: user.name, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (_req, res) => {
  // For JWT, logout is frontend-based
  res.status(200).json({ message: 'Logout successful' });
};
