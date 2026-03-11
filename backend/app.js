require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// Required for Express behind Vercel/nginx proxy
app.set('trust proxy', 1);

// ─── CORS — VERY FIRST middleware ─────────────────────────────────────
// Allow ALL origins (we use Bearer tokens, not cookies, so * is safe)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ─── Security Middleware ───────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(mongoSanitize());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 2) MongoDB connection (use the shared cached connector)
const connectDB = require('./config/db');

// Middleware to ensure DB is connected before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// 4) JWT Auth Middleware
const { verifyToken, requireRole } = require('./middleware/auth');

// 5) Routes
// Public routes — auth has NO middleware (no rate limiter, no JWT)
app.use('/auth', require('./routes/auth'));
app.use('/contact', require('./routes/contact'));
app.use('/cron', require('./routes/cronSync'));

// Semi-protected routes (some endpoints are public, most require JWT)
// JWT is checked inside each route file where needed
app.use('/students', require('./routes/students'));
app.use('/counselors', require('./routes/counselors'));
app.use('/sessions', require('./routes/sessions'));

// Admin-only routes (valid JWT + admin role required)
app.use('/support', require('./routes/support'));
app.use('/sheets', verifyToken, requireRole('admin'), require('./routes/sheets'));
app.use('/admin-data', verifyToken, requireRole('admin'), require('./routes/adminData'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 5) Error handler — never leak internal details to the client
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'An internal server error occurred.' });
});

module.exports = app;
