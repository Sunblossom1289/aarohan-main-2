// backend/routes/contact.js
// Routes for the "Get in Touch" contact form → Google Sheets

const express = require('express');
const router = express.Router();
const contactSheet = require('../services/contactSheet');
const googleSheets = require('../services/googleSheets');

// ─────────────────────────────────────────────
// 1. SUBMIT — Append a contact form entry to the sheet
// ─────────────────────────────────────────────
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Check if sheets is authenticated
    const authenticated = await googleSheets.isAuthenticated();
    if (!authenticated) {
      console.warn('⚠️  Google Sheets not authenticated — contact form submission stored only in logs');
      console.log('📬 Contact submission (no sheet):', { name, email, phone, message: message.substring(0, 100) });
      return res.json({ success: true, message: 'Thank you! We will get back to you soon.' });
    }

    // Get existing sheet ID (checks memory → env → MongoDB)
    let sheetId = await contactSheet.getSpreadsheetId();
    if (!sheetId) {
      try {
        sheetId = await contactSheet.createContactSheet();
        console.log('✅ Auto-created contact sheet:', sheetId);
      } catch (createErr) {
        console.error('Failed to auto-create contact sheet:', createErr.message);
        // Still succeed from the user's perspective
        return res.json({ success: true, message: 'Thank you! We will get back to you soon.' });
      }
    }

    // Append the submission
    await contactSheet.appendContactSubmission({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    res.json({
      success: true,
      message: 'Thank you! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    // ALWAYS return success to the user — never block UX due to backend/sheet issues
    res.json({ success: true, message: 'Thank you! We will get back to you soon.' });
  }
});

// ─────────────────────────────────────────────
// 2. STATUS — Check if contact sheet is connected
// ─────────────────────────────────────────────
router.get('/status', async (req, res) => {
  const authenticated = await googleSheets.isAuthenticated();
  const sheetId = await contactSheet.getSpreadsheetId();

  res.json({
    success: true,
    contactSheetConnected: authenticated && !!sheetId,
    spreadsheetId: sheetId || null,
    spreadsheetUrl: sheetId
      ? `https://docs.google.com/spreadsheets/d/${sheetId}`
      : null,
  });
});

// ─────────────────────────────────────────────
// 3. CREATE — Manually create the contact sheet
// ─────────────────────────────────────────────
router.post('/create-sheet', async (req, res) => {
  try {
    const authenticated = await googleSheets.isAuthenticated();
    if (!authenticated) {
      return res.status(401).json({ success: false, error: 'Google Sheets not authenticated. Connect via /sheets/oauth/start first.' });
    }

    const sheetId = await contactSheet.createContactSheet();
    res.json({
      success: true,
      spreadsheetId: sheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      message: 'Contact sheet created! Optionally set GOOGLE_CONTACT_SHEET_ID in your env.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
// 4. CONNECT — Connect an existing spreadsheet
// ─────────────────────────────────────────────
router.post('/connect', (req, res) => {
  const { spreadsheetId } = req.body;
  if (!spreadsheetId) {
    return res.status(400).json({ success: false, error: 'spreadsheetId is required' });
  }

  contactSheet.setSpreadsheetId(spreadsheetId);

  res.json({
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  });
});

module.exports = router;
