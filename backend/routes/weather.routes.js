const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');

// Public route - no authentication needed
router.get('/', weatherController.getWeather);

module.exports = router;

