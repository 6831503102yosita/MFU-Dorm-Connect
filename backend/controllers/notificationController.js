'use strict';
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

function listNotifications(req, res) {
  try {
    const notifications = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(req.user.id);
    const unread_count = notifications.filter(n => !n.is_read).length;
    return res.json({ notifications, unread_count });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

function markRead(req, res) {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark notification' });
  }
}

function markAllRead(req, res) {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark notifications' });
  }
}

function listAnnouncements(req, res) {
  try {
    const { building } = req.query;
    let announcements;
    if (building) {
      announcements = db.prepare(
        "SELECT * FROM announcements WHERE target_building IS NULL OR target_building = ? ORDER BY created_at DESC LIMIT 20"
      ).all(building);
    } else {
      announcements = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC LIMIT 20').all();
    }
    return res.json({ announcements });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}

function createAnnouncement(req, res) {
  try {
    const { title_en, title_th, body_en, body_th, target_building } = req.body;
    if (!title_en || !body_en) return res.status(400).json({ error: 'Title and body are required' });
    const id = uuidv4();
    db.prepare(`
      INSERT INTO announcements (id, title_en, title_th, body_en, body_th, target_building, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title_en, title_th || title_en, body_en, body_th || body_en, target_building || null, req.user.id);
    const ann = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
    return res.status(201).json({ announcement: ann });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
}

module.exports = { listNotifications, markRead, markAllRead, listAnnouncements, createAnnouncement };
