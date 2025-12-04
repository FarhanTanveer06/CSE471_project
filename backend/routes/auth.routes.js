const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { body } = require('express-validator');

router.post('/signup', [
  body('phone').isString().isLength({ min: 8 }).withMessage('Enter valid phone number'),
  body('password').isLength({ min: 6 })
], authController.signup);
router.post('/login', [
  body('phone').isString().isLength({ min: 8 }).withMessage('Enter valid phone number'),
  body('password').isLength({ min: 6 })
], authController.login);
router.post('/logout', authController.logout);

module.exports = router;
