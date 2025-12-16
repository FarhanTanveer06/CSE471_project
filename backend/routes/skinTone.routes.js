const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const skinToneController = require('../controllers/skinTone.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'face-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protected route - user must be logged in
router.post('/analyze', authMiddleware, upload.single('image'), skinToneController.analyzeSkinTone);

module.exports = router;

