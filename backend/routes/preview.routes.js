const express = require('express');
const router = express.Router();
const previewController = require('../controllers/preview.controller');
const auth = require('../middlewares/authMiddleware');

// All preview routes require authentication
router.get('/', auth, previewController.getPreview);
router.post('/add', auth, previewController.addToPreview);
router.delete('/item/:itemId', auth, previewController.removeFromPreview);
router.delete('/clear', auth, previewController.clearPreview);

module.exports = router;

