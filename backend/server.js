'use strict';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Init DB (runs migration on startup)
require('./models/db');

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many login attempts, please try again later' } }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many registration attempts' } }));
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 200 }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/parcels', require('./routes/parcels'));
app.use('/api/repairs', require('./routes/repairs'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.resolve(__dirname, '../frontend/dist');
  if (fs.existsSync(frontendBuild)) {
    app.use(express.static(frontendBuild));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuild, 'index.html'));
    });
  }
}

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MFU Dorm Connect API running on port ${PORT}`);
});

module.exports = app;
