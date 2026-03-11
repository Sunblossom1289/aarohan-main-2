// backend/routes/cronSync.js
// Vercel Cron endpoint — runs on a schedule to batch-sync all data to Google Sheets.
// Replaces the old fire-and-forget inline sync calls (which burned CPU on every request).

const express = require('express');
const router = express.Router();

/**
 * POST /cron/sync-sheets
 * 
 * Called by Vercel Cron (see backend/vercel.json → "crons" section).
 * Protected by the CRON_SECRET env var so only Vercel's scheduler can invoke it.
 *
 * Performs:
 *   1. Full student journey sync  → Student Tracker Sheet
 *   2. Full sessions + availability sync → Sessions Tracker Sheet
 */
router.get('/sync-sheets', async (req, res) => {
  try {
    // ── Auth guard: CRON_SECRET is REQUIRED — reject if not configured ──
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error('CRON_SECRET env var is not set — cron endpoint disabled for security.');
      return res.status(503).json({ success: false, error: 'Cron endpoint not configured.' });
    }

    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const googleSheets = require('../services/googleSheets');
    const sessionsSheet = require('../services/sessionsSheet');

    const authenticated = await googleSheets.isAuthenticated();
    if (!authenticated) {
      return res.json({
        success: true,
        message: 'Google Sheets not authenticated — skipping sync',
        studentSync: null,
        sessionsSync: null,
      });
    }

    // 1. Student Journey Sheet sync
    let studentResult = null;
    const studentSheetId = await googleSheets.getSpreadsheetId();
    if (studentSheetId) {
      studentResult = await googleSheets.fullSync();
      console.log(`📊 Cron: Student sync complete — ${studentResult.synced} students`);
    }

    // 2. Sessions + Availability Sheet sync
    let sessionsResult = null;
    const sessionsSheetId = await sessionsSheet.getSpreadsheetId();
    if (sessionsSheetId) {
      sessionsResult = await sessionsSheet.fullSync();
      console.log(`📊 Cron: Sessions sync complete — ${sessionsResult.sessions} sessions, ${sessionsResult.availabilitySlots} slots`);
    }

    res.json({
      success: true,
      message: 'Cron sync completed',
      studentSync: studentResult,
      sessionsSync: sessionsResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron sync error:', error);
    res.status(500).json({ success: false, error: 'Cron sync failed.' });
  }
});

module.exports = router;
