'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

const SALT_ROUNDS = 12;

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

async function register(req, res) {
  try {
    const { full_name, student_id, email, password, dorm_building, room_number } = req.body;

    if (!full_name || !student_id || !email || !password || !dorm_building || !room_number) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters with uppercase, lowercase, and number' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR student_id = ?').get(email, student_id);
    if (existing) {
      return res.status(409).json({ error: 'Email or Student ID already registered' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, full_name, student_id, email, password_hash, dorm_building, room_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, full_name.trim(), student_id.trim(), email.toLowerCase().trim(), password_hash, dorm_building, room_number.trim());

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const token = generateToken(id);

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
}

function getProfile(req, res) {
  return res.json({ user: req.user });
}

async function updateProfile(req, res) {
  try {
    const { full_name, dorm_building, room_number, email, language } = req.body;
    const userId = req.user.id;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (email && email !== req.user.email) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    db.prepare(`
      UPDATE users SET
        full_name = COALESCE(?, full_name),
        dorm_building = COALESCE(?, dorm_building),
        room_number = COALESCE(?, room_number),
        email = COALESCE(?, email),
        language = COALESCE(?, language),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(full_name || null, dorm_building || null, room_number || null,
           email ? email.toLowerCase().trim() : null, language || null, userId);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    return res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    console.error('Update profile error:', err.message);
    return res.status(500).json({ error: 'Profile update failed' });
  }
}

async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }
    if (new_password.length < 6 || !/[A-Z]/.test(new_password) || !/[a-z]/.test(new_password) || !/[0-9]/.test(new_password)) {
      return res.status(400).json({ error: 'New password must be at least 6 characters with uppercase, lowercase, and number' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hash = await bcrypt.hash(new_password, SALT_ROUNDS);
    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(hash, req.user.id);
    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    return res.status(500).json({ error: 'Password change failed' });
  }
}

function uploadAvatar(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const avatarUrl = `/uploads/${req.file.filename}`;
  db.prepare("UPDATE users SET avatar_url = ?, updated_at = datetime('now') WHERE id = ?").run(avatarUrl, req.user.id);
  return res.json({ avatar_url: avatarUrl });
}

module.exports = { register, login, getProfile, updateProfile, changePassword, uploadAvatar };
