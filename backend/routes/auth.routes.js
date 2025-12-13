const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

router.post('/signup', [
  body('name').isString().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').isString().isLength({ min: 8 }).withMessage('Enter valid phone number'),
  body('username').optional().isString().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.signup);

router.post('/login', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.login);

router.post('/logout', authController.logout);

// Verify token endpoint - protected route
router.get('/verify', auth, authController.verifyToken);

module.exports = router;
