// backend/api/index.js — Vercel serverless entry point
// Wraps Express app with crash protection so CORS headers are always sent

let app;
try {
  app = require('../app');
} catch (err) {
  // If the Express app fails to load, return a handler that
  // always responds with CORS headers + the actual error so we can debug.
  console.error('FATAL: Express app failed to load:', err);
  app = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();
    res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      detail: err.message
    });
  };
}

module.exports = app;
