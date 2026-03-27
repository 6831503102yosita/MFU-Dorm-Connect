'use strict';
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/authController');

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.getProfile);
router.put('/me', auth, c.updateProfile);
router.put('/me/password', auth, c.changePassword);
router.post('/me/avatar', auth, upload.single('avatar'), c.uploadAvatar);

module.exports = router;
