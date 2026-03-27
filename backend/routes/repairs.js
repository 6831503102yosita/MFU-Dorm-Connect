'use strict';
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/repairController');

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `repair_${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

router.get('/', auth, c.listRepairs);
router.post('/', auth, upload.array('photos', 3), c.createRepair);
router.get('/:id', auth, c.getRepair);
router.patch('/:id/status', auth, c.updateRepairStatus);
router.delete('/:id', auth, c.deleteRepair);

module.exports = router;
