'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './data/mfu_dorm.db';
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    dorm_building TEXT NOT NULL,
    room_number TEXT NOT NULL,
    avatar_url TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parcels (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tracking_number TEXT NOT NULL,
    carrier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scanned',
    location TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS repair_requests (
    id TEXT PRIMARY KEY,
    ticket_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    photo_urls TEXT NOT NULL DEFAULT '[]',
    assigned_to TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_th TEXT NOT NULL,
    body_en TEXT NOT NULL,
    body_th TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_th TEXT NOT NULL,
    body_en TEXT NOT NULL,
    body_th TEXT NOT NULL,
    target_building TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ticket_counter (
    id INTEGER PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 1000
  );

  INSERT OR IGNORE INTO ticket_counter (id, value) VALUES (1, 1000);

  CREATE INDEX IF NOT EXISTS idx_parcels_user ON parcels(user_id);
  CREATE INDEX IF NOT EXISTS idx_repair_user ON repair_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
`);

module.exports = db;
