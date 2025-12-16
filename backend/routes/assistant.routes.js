const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');
const auth = require('../middlewares/authMiddleware');

router.post('/suggest', auth, assistantController.suggestOutfit);

module.exports = router;
