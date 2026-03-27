'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/notificationController');

router.get('/', auth, c.listNotifications);
router.patch('/:id/read', auth, c.markRead);
router.patch('/read-all', auth, c.markAllRead);

router.get('/announcements', auth, c.listAnnouncements);
router.post('/announcements', auth, c.createAnnouncement);

module.exports = router;
