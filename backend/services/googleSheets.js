// backend/services/googleSheets.js
// Google Sheets "Second Backend" — OAuth-based real-time student journey tracker
// Uses MongoDB for token storage (works on Vercel serverless)

const { OAuth2Client } = require('google-auth-library');
const { sheets: sheetsFactory } = require('@googleapis/sheets');
const mongoose = require('mongoose');

// ── Config ──
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar',
];

// Column layout for the tracker sheet
const SHEET_HEADERS = [
  'Student ID',        // A
  'Name',              // B
  'Phone',             // C
  'Email',             // D
  'School',            // E
  'Grade',             // F
  'Registered',        // G  (Yes/No)
  'Registration Date', // H
  'Profile Completed', // I  (Yes/No)
  'Aptitude Test',     // J  (Not Started / In Progress / Completed)
  'Personality Test',  // K
  'Interest Test',     // L
  'Sessions Booked',   // M  (count)
  'Program',           // N  (1/2/3)
  'Last Updated',      // O
];

const SHEET_NAME = 'Student Journey';

// ── OAuth2 Client ──
let oauth2Client = null;
let sheetsApi = null;
let spreadsheetId = null;

// ── MongoDB model for storing tokens (serverless-safe) ──
// Reuse the shared AppConfig model (defined in models/AppConfig.js)
const AppConfig = require('../models/AppConfig');

async function loadTokensFromDB() {
  try {
    const doc = await AppConfig.findOne({ key: 'google_sheets_tokens' });
    return doc ? doc.value : null;
  } catch (e) {
    console.warn('⚠️  Could not load tokens from DB:', e.message);
    return null;
  }
}

async function saveTokensToDB(tokens) {
  try {
    await AppConfig.findOneAndUpdate(
      { key: 'google_sheets_tokens' },
      { value: tokens, updatedAt: new Date() },
      { upsert: true }
    );
    console.log('🔄 Google Sheets: Tokens saved to DB');
  } catch (e) {
    console.error('Failed to save tokens to DB:', e.message);
  }
}

/**
 * Initialize the OAuth2 client from environment variables.
 * Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
 */
async function getOAuth2Client() {
  if (oauth2Client) return oauth2Client;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/sheets/oauth/callback';

  if (!clientId || !clientSecret) {
    console.warn('⚠️  Google Sheets OAuth: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return null;
  }

  oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  // Try to load saved tokens from MongoDB
  const tokens = await loadTokensFromDB();
  if (tokens) {
    oauth2Client.setCredentials(tokens);
    console.log('✅ Google Sheets: Loaded saved OAuth tokens from DB');
  }

  // Auto-refresh tokens → persist to MongoDB
  oauth2Client.on('tokens', async (newTokens) => {
    const existing = await loadTokensFromDB();
    const merged = { ...(existing || {}), ...newTokens };
    await saveTokensToDB(merged);
  });

  return oauth2Client;
}

/**
 * Generate the OAuth consent URL. 
 * User visits this to authorize the app.
 */
async function getAuthUrl() {
  const client = await getOAuth2Client();
  if (!client) return null;

  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force refresh_token on every auth
    scope: SCOPES,
  });
}

/**
 * Exchange the authorization code for tokens.
 */
async function handleOAuthCallback(code) {
  const client = await getOAuth2Client();
  if (!client) throw new Error('OAuth client not initialized');

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Persist to MongoDB
  await saveTokensToDB(tokens);
  console.log('✅ Google Sheets: OAuth tokens saved to DB');

  // Initialize sheets API
  sheetsApi = sheetsFactory({ version: 'v4', auth: client });

  return tokens;
}

/**
 * Check if we have valid OAuth credentials.
 */
async function isAuthenticated() {
  const client = await getOAuth2Client();
  if (!client) return false;
  const creds = client.credentials;
  return !!(creds && (creds.access_token || creds.refresh_token));
}

/**
 * Get (or create) the Sheets API instance.
 */
async function getSheetsApi() {
  if (sheetsApi) return sheetsApi;

  const client = await getOAuth2Client();
  const authenticated = await isAuthenticated();
  if (!client || !authenticated) return null;

  sheetsApi = sheetsFactory({ version: 'v4', auth: client });
  return sheetsApi;
}

// ── Persist student tracker sheet ID to MongoDB ──
let sheetIdLoadedFromDB = false;

async function loadSheetIdFromDB() {
  if (sheetIdLoadedFromDB) return;
  sheetIdLoadedFromDB = true;
  try {
    const doc = await AppConfig.findOne({ key: 'student_tracker_sheet_id' });
    if (doc && doc.value) {
      spreadsheetId = doc.value;
      console.log('📊 Student Tracker Sheet ID loaded from DB:', spreadsheetId);
    }
  } catch (e) {
    console.warn('⚠️  Could not load student tracker sheet ID from DB:', e.message);
  }
}

async function saveSheetIdToDB(id) {
  try {
    await AppConfig.findOneAndUpdate(
      { key: 'student_tracker_sheet_id' },
      { value: id, updatedAt: new Date() },
      { upsert: true }
    );
    console.log('📊 Student Tracker Sheet ID saved to DB:', id);
  } catch (e) {
    console.error('Failed to save student tracker sheet ID to DB:', e.message);
  }
}

/**
 * Get the spreadsheet ID (from memory, env, or DB).
 */
async function getSpreadsheetId() {
  if (spreadsheetId) return spreadsheetId;
  spreadsheetId = process.env.GOOGLE_SHEET_ID || null;
  if (spreadsheetId) return spreadsheetId;
  await loadSheetIdFromDB();
  return spreadsheetId;
}

async function setSpreadsheetId(id) {
  spreadsheetId = id;
  await saveSheetIdToDB(id);
}

// ═══════════════════════════════════════════════════════════════
// SHEET OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new spreadsheet and set up headers + formatting.
 * Returns the spreadsheet ID.
 */
async function createTrackerSheet() {
  const sheets = await getSheetsApi();
  if (!sheets) throw new Error('Sheets API not authenticated');

  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'Aarohan - Student Journey Tracker' },
      sheets: [{
        properties: {
          title: SHEET_NAME,
          gridProperties: { frozenRowCount: 1 }
        }
      }]
    }
  });

  const newId = res.data.spreadsheetId;
  spreadsheetId = newId;
  await saveSheetIdToDB(newId);
  console.log('✅ Created tracker spreadsheet:', newId);

  // Write headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: newId,
    range: `'${SHEET_NAME}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [SHEET_HEADERS] }
  });

  // Format header row (bold + colored background)
  const sheetId = res.data.sheets[0].properties.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: newId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.47, blue: 0.87 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        },
        // Auto-resize columns
        {
          autoResizeDimensions: {
            dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: SHEET_HEADERS.length }
          }
        }
      ]
    }
  });

  return newId;
}

/**
 * Find the row number for a student by their MongoDB _id.
 * Returns 0-indexed row number (1-based in sheets), or -1 if not found.
 */
async function findStudentRow(studentId) {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) return -1;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${SHEET_NAME}'!A:A`,
    });

    const rows = res.data.values || [];
    for (let i = 1; i < rows.length; i++) { // skip header
      if (rows[i][0] === String(studentId)) return i + 1; // 1-based row number
    }
    return -1;
  } catch (e) {
    console.error('Google Sheets findStudentRow error:', e.message);
    return -1;
  }
}

/**
 * Build a row array from a student document + session count.
 */
function buildRowFromStudent(student, sessionCount = 0) {
  return [
    String(student._id),
    student.name || '',
    student.phone || '',
    student.email || '',
    student.school || '',
    student.grade != null ? String(student.grade) : '',
    'Yes', // If this function is called, the student is registered
    student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
    student.profileCompleted ? 'Yes' : 'No',
    formatTestStatus(student.aptitudeStatus),
    formatTestStatus(student.personalityStatus),
    formatTestStatus(student.interestStatus),
    String(sessionCount),
    String(student.program || 1),
    new Date().toLocaleString('en-IN'),
  ];
}

function formatTestStatus(status) {
  switch (status) {
    case 'completed': return '✅ Completed';
    case 'in_progress': return '🔄 In Progress';
    default: return '❌ Not Started';
  }
}

/**
 * Sync a single student to the sheet (upsert — insert or update).
 * This is the main function called by route hooks.
 */
async function syncStudent(student, sessionCount) {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();

  if (!sheets || !sheetId) {
    // Silently skip if sheets not configured — don't break the main backend
    return;
  }

  try {
    // If sessionCount not provided, fetch it
    if (sessionCount === undefined || sessionCount === null) {
      const Session = require('../models/Session');
      sessionCount = await Session.countDocuments({ student: student._id });
    }

    const rowData = buildRowFromStudent(student, sessionCount);
    const existingRow = await findStudentRow(student._id);

    if (existingRow > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${SHEET_NAME}'!A${existingRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [rowData] }
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${SHEET_NAME}'!A:O`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [rowData] }
      });
    }

    console.log(`📊 Sheets synced: ${student.name || student.phone} (row ${existingRow > 0 ? existingRow : 'new'})`);
  } catch (error) {
    // Never let sheet errors break the main flow
    console.error('📊 Google Sheets sync error (non-fatal):', error.message);
  }
}

/**
 * Full sync — dump all students to the sheet.
 * Useful for initial setup or manual resync.
 */
async function fullSync() {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) throw new Error('Sheets API not ready');

  const Student = require('../models/Student');
  const Session = require('../models/Session');

  const students = await Student.find().lean();

  // Get session counts in one aggregation
  const sessionCounts = await Session.aggregate([
    { $group: { _id: '$student', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  sessionCounts.forEach(s => { countMap[String(s._id)] = s.count; });

  // Build all rows
  const rows = students.map(student =>
    buildRowFromStudent(student, countMap[String(student._id)] || 0)
  );

  // Clear existing data (keep headers)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: `'${SHEET_NAME}'!A2:O`,
  });

  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${SHEET_NAME}'!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: rows }
    });
  }

  console.log(`📊 Full sync complete: ${rows.length} students`);
  return { synced: rows.length };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

/**
 * Read all data from the Student Journey tracker sheet.
 * Returns { headers: [...], rows: [[...], ...] }
 */
async function readAllData() {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) throw new Error('Sheets API not ready');

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${SHEET_NAME}'!A1:O`,
  });

  const allRows = res.data.values || [];
  const headers = allRows.length > 0 ? allRows[0] : SHEET_HEADERS;
  const rows = allRows.slice(1);

  return { headers, rows };
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  handleOAuthCallback,
  isAuthenticated,
  getSpreadsheetId,
  setSpreadsheetId,
  createTrackerSheet,
  syncStudent,
  fullSync,
  readAllData,
  SHEET_HEADERS,
};
