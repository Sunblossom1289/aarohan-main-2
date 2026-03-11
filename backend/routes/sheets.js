// backend/routes/sheets.js
// Routes for Google Sheets "second backend" — OAuth setup, sync, status

const express = require('express');
const router = express.Router();
const googleSheets = require('../services/googleSheets');
const sessionsSheet = require('../services/sessionsSheet');

// ─────────────────────────────────────────────
// 1. STATUS — Check if Google Sheets is connected
// ─────────────────────────────────────────────
router.get('/status', async (req, res) => {
  const authenticated = await googleSheets.isAuthenticated();
  const sheetId = await googleSheets.getSpreadsheetId();

  res.json({
    success: true,
    sheetsConnected: authenticated,
    spreadsheetId: sheetId || null,
    spreadsheetUrl: sheetId
      ? `https://docs.google.com/spreadsheets/d/${sheetId}`
      : null,
  });
});

// ─────────────────────────────────────────────
// 1b. OAUTH UI — Simple page for admins to connect Google
// ─────────────────────────────────────────────
router.get('/oauth/ui', async (req, res) => {
  const authenticated = await googleSheets.isAuthenticated();
  const sheetId = await googleSheets.getSpreadsheetId();

  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;

  const statusText = authenticated ? 'Connected' : 'Not connected';
  const statusColor = authenticated ? '#16a34a' : '#dc2626';

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Aarohan - Google OAuth</title>
    <style>
      body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; }
      .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 520px; width: 92%; }
      h1 { margin: 0 0 8px 0; font-size: 22px; }
      .status { color: ${statusColor}; font-weight: 700; }
      .btn { display: inline-block; margin-top: 16px; background: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 10px; font-weight: 600; }
      .note { margin-top: 12px; color: #64748b; font-size: 14px; }
      .warn { color: #b45309; font-size: 14px; margin-top: 12px; }
      code { background: #f1f5f9; padding: 2px 6px; border-radius: 6px; }
    </style>
    </head>
    <body>
      <div class="card">
        <h1>Google OAuth Status</h1>
        <div>Sheets/Calendar: <span class="status">${statusText}</span></div>
        ${sheetId ? `<div class="note">Spreadsheet: <a href="https://docs.google.com/spreadsheets/d/${sheetId}" target="_blank">Open</a></div>` : ''}
        ${(hasClientId && hasClientSecret) ? '' : '<div class="warn">Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in backend env.</div>'}
        <a class="btn" href="/sheets/oauth/start?redirect=true">Connect Google Account</a>
        <div class="note">After connecting, Meet links will be generated automatically when sessions are booked.</div>
      </div>
    </body>
    </html>
  `);
});

// ─────────────────────────────────────────────
// 2. OAUTH — Start the authorization flow
// ─────────────────────────────────────────────
router.get('/oauth/start', async (req, res) => {
  const url = await googleSheets.getAuthUrl();
  if (!url) {
    return res.status(500).json({
      success: false,
      error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
  }

  // If browser visit, redirect. If API call, return URL.
  if (req.query.redirect === 'true') {
    return res.redirect(url);
  }

  res.json({ success: true, authUrl: url });
});

// ─────────────────────────────────────────────
// 3. OAUTH CALLBACK — Exchange code for tokens
// ─────────────────────────────────────────────
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Missing authorization code' });
    }

    await googleSheets.handleOAuthCallback(code);

    // Auto-create or connect spreadsheet
    let sheetId = await googleSheets.getSpreadsheetId();
    let created = false;

    if (!sheetId) {
      sheetId = await googleSheets.createTrackerSheet();
      created = true;
    }

    // Auto-create sessions tracker sheet if not yet created
    let sessionsSheetId = await sessionsSheet.getSpreadsheetId();
    let sessionsCreated = false;
    if (!sessionsSheetId) {
      try {
        sessionsSheetId = await sessionsSheet.createSessionsSheet();
        sessionsCreated = true;
        console.log('✅ Auto-created Sessions Tracker sheet:', sessionsSheetId);
      } catch (sessErr) {
        console.error('⚠️  Could not auto-create Sessions sheet:', sessErr.message);
      }
    }

    // Return a nice HTML page so the admin knows it worked
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Aarohan - Sheets Connected</title>
      <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f4f8; }
        .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
        h1 { color: #2563eb; margin-bottom: 8px; }
        a { color: #2563eb; }
        .tag { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 99px; font-size: 14px; margin-top: 8px; }
      </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Google Sheets Connected!</h1>
          <p class="tag">${created ? 'New spreadsheet created' : 'Using existing spreadsheet'}</p>          ${sessionsCreated ? '<p class=\"tag\" style=\"background:#dbeafe;color:#1e40af;\">Sessions tracker created</p>' : ''}          <p style="margin-top: 20px;">
            <a href="https://docs.google.com/spreadsheets/d/${sheetId}" target="_blank">
              📊 Open Tracker Spreadsheet
            </a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
            Student journey data will now sync automatically.<br/>
            You can close this tab.
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
// 4. CONNECT EXISTING SHEET
// ─────────────────────────────────────────────
router.post('/connect', async (req, res) => {
  const { spreadsheetId } = req.body;
  if (!spreadsheetId) {
    return res.status(400).json({ success: false, error: 'spreadsheetId is required' });
  }

  await googleSheets.setSpreadsheetId(spreadsheetId);

  res.json({
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  });
});

// ─────────────────────────────────────────────
// 5. CREATE NEW TRACKER SHEET
// ─────────────────────────────────────────────
router.post('/create', async (req, res) => {
  try {
    if (!(await googleSheets.isAuthenticated())) {
      return res.status(401).json({ success: false, error: 'Not authenticated. Visit /sheets/oauth/start first.' });
    }

    const sheetId = await googleSheets.createTrackerSheet();
    res.json({
      success: true,
      spreadsheetId: sheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
// 6. FULL SYNC — Pull all students from DB → Sheet
// ─────────────────────────────────────────────
router.post('/sync', async (req, res) => {
  try {
    if (!(await googleSheets.isAuthenticated())) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    if (!(await googleSheets.getSpreadsheetId())) {
      return res.status(400).json({ success: false, error: 'No spreadsheet connected. POST /sheets/create or /sheets/connect first.' });
    }

    const result = await googleSheets.fullSync();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// SESSIONS SHEET ROUTES
// ═══════════════════════════════════════════════════════════════

// 7. STATUS — Check Sessions Sheet connection
router.get('/sessions/status', async (req, res) => {
  const authenticated = await googleSheets.isAuthenticated();
  const sheetId = await sessionsSheet.getSpreadsheetId();

  res.json({
    success: true,
    sessionsSheetConnected: authenticated && !!sheetId,
    spreadsheetId: sheetId || null,
    spreadsheetUrl: sheetId
      ? `https://docs.google.com/spreadsheets/d/${sheetId}`
      : null,
  });
});

// 8. CREATE Sessions Tracker Sheet
router.post('/sessions/create', async (req, res) => {
  try {
    if (!(await googleSheets.isAuthenticated())) {
      return res.status(401).json({ success: false, error: 'Not authenticated. Visit /sheets/oauth/start first.' });
    }

    const sheetId = await sessionsSheet.createSessionsSheet();
    res.json({
      success: true,
      spreadsheetId: sheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      message: 'Sessions tracker created! Add the spreadsheet ID to your GOOGLE_SESSIONS_SHEET_ID env variable.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. CONNECT existing Sessions Sheet
router.post('/sessions/connect', async (req, res) => {
  const { spreadsheetId } = req.body;
  if (!spreadsheetId) {
    return res.status(400).json({ success: false, error: 'spreadsheetId is required' });
  }

  await sessionsSheet.setSpreadsheetId(spreadsheetId);

  res.json({
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  });
});

// 10. FULL SYNC — Dump all sessions + availability to sheet
router.post('/sessions/sync', async (req, res) => {
  try {
    if (!(await googleSheets.isAuthenticated())) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    if (!(await sessionsSheet.getSpreadsheetId())) {
      return res.status(400).json({ success: false, error: 'No sessions sheet connected. POST /sheets/sessions/create first.' });
    }

    const result = await sessionsSheet.fullSync();
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// LIVE DATA READ ENDPOINTS (for Admin Dashboard tabs)
// ═══════════════════════════════════════════════════════════════

// 11. READ Student Journey Sheet data
router.get('/data/students', async (req, res) => {
  try {
    if (!(await googleSheets.isAuthenticated())) {
      return res.status(401).json({ success: false, error: 'Google Sheets not authenticated' });
    }
    if (!(await googleSheets.getSpreadsheetId())) {
      return res.status(400).json({ success: false, error: 'No student tracker sheet connected' });
    }

    const data = await googleSheets.readAllData();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Read student sheet error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. READ Sessions + Availability Sheet data
router.get('/data/sessions', async (req, res) => {
  try {
    if (!(await googleSheets.isAuthenticated())) {
      return res.status(401).json({ success: false, error: 'Google Sheets not authenticated' });
    }
    if (!(await sessionsSheet.getSpreadsheetId())) {
      return res.status(400).json({ success: false, error: 'No sessions sheet connected' });
    }

    const data = await sessionsSheet.readAllData();
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Read sessions sheet error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
