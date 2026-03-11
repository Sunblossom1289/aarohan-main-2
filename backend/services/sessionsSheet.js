// backend/services/sessionsSheet.js
// Google Sheets tracker for ALL session-related data:
//   • Counselor availability slots
//   • Student bookings
//   • Session status, Meet links, notes, completion
// Reuses the same OAuth2 client from googleSheets.js

const { sheets: sheetsFactory } = require('@googleapis/sheets');
const mongoose = require('mongoose');

let sheetsApi = null;
let sessionsSpreadsheetId = null;
let loadedFromDB = false;

// ── Persist sheet ID to MongoDB (survives serverless restarts) ──
async function loadSheetIdFromDB() {
  if (loadedFromDB) return;
  loadedFromDB = true;
  try {
    const AppConfig = mongoose.models.AppConfig || require('../models/AppConfig');
    const doc = await AppConfig.findOne({ key: 'sessions_sheet_id' });
    if (doc && doc.value) {
      sessionsSpreadsheetId = doc.value;
      console.log('📊 Sessions Sheet ID loaded from DB:', sessionsSpreadsheetId);
    }
  } catch (e) {
    console.warn('⚠️  Could not load sessions sheet ID from DB:', e.message);
  }
}

async function saveSheetIdToDB(id) {
  try {
    const AppConfig = mongoose.models.AppConfig || require('../models/AppConfig');
    await AppConfig.findOneAndUpdate(
      { key: 'sessions_sheet_id' },
      { value: id, updatedAt: new Date() },
      { upsert: true }
    );
    console.log('📊 Sessions Sheet ID saved to DB:', id);
  } catch (e) {
    console.error('Failed to save sessions sheet ID to DB:', e.message);
  }
}

// ── Sheet names (tabs) ──
const TABS = {
  SESSIONS: 'Sessions',
  AVAILABILITY: 'Counselor Availability',
};

// ── Column headers ──
const SESSION_HEADERS = [
  'Session ID',         // A
  'Status',             // B
  'Scheduled Date',     // C
  'Start Time',         // D
  'End Time',           // E
  'Counselor Name',     // F
  'Counselor Email',    // G
  'Counselor Phone',    // H
  'Student Name',       // I
  'Student Email',      // J
  'Student Phone',      // K
  'Student Grade',      // L
  'Student School',     // M
  'Meet Link',          // N
  'Counselor Notes',    // O
  'Booked At',          // P
  'Completed At',       // Q
  'Last Updated',       // R
];

const AVAILABILITY_HEADERS = [
  'Slot ID',            // A
  'Counselor Name',     // B
  'Counselor Email',    // C
  'Date',               // D
  'Start Time',         // E
  'End Time',           // F
  'Is Booked',          // G
  'Booked By (Student)',// H
  'Session ID',         // I
  'Created At',         // J
];

// ── Helpers ──

async function getSheetsApi() {
  if (sheetsApi) return sheetsApi;

  const { getOAuth2Client, isAuthenticated } = require('./googleSheets');
  const client = await getOAuth2Client();
  const authed = await isAuthenticated();
  if (!client || !authed) return null;

  sheetsApi = sheetsFactory({ version: 'v4', auth: client });
  return sheetsApi;
}

async function getSpreadsheetId() {
  if (sessionsSpreadsheetId) return sessionsSpreadsheetId;
  // Try env first
  sessionsSpreadsheetId = process.env.GOOGLE_SESSIONS_SHEET_ID || null;
  if (sessionsSpreadsheetId) return sessionsSpreadsheetId;
  // Then try DB
  await loadSheetIdFromDB();
  return sessionsSpreadsheetId;
}

async function setSpreadsheetId(id) {
  sessionsSpreadsheetId = id;
  await saveSheetIdToDB(id);
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatTime(t) {
  if (!t) return '';
  const [hour, minute] = t.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h}:${String(minute).padStart(2, '0')} ${period}`;
}

function statusEmoji(status) {
  switch (status) {
    case 'confirmed': return '✅ Confirmed';
    case 'completed': return '🏁 Completed';
    case 'cancelled': return '❌ Cancelled';
    default: return status || '';
  }
}

// ═══════════════════════════════════════════════════════════════
// CREATE THE SPREADSHEET
// ═══════════════════════════════════════════════════════════════

async function createSessionsSheet() {
  const sheets = await getSheetsApi();
  if (!sheets) throw new Error('Sheets API not authenticated');

  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'Aarohan - Sessions Tracker' },
      sheets: [
        {
          properties: {
            title: TABS.SESSIONS,
            index: 0,
            gridProperties: { frozenRowCount: 1 }
          }
        },
        {
          properties: {
            title: TABS.AVAILABILITY,
            index: 1,
            gridProperties: { frozenRowCount: 1 }
          }
        }
      ]
    }
  });

  const newId = res.data.spreadsheetId;
  sessionsSpreadsheetId = newId;
  await saveSheetIdToDB(newId);
  console.log('✅ Created Sessions spreadsheet:', newId);

  // Write headers to both tabs
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: newId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        {
          range: `'${TABS.SESSIONS}'!A1`,
          values: [SESSION_HEADERS]
        },
        {
          range: `'${TABS.AVAILABILITY}'!A1`,
          values: [AVAILABILITY_HEADERS]
        }
      ]
    }
  });

  // Format header rows (bold + colored)
  const sessionsSheetId = res.data.sheets[0].properties.sheetId;
  const availSheetId = res.data.sheets[1].properties.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: newId,
    requestBody: {
      requests: [
        // Sessions tab header
        {
          repeatCell: {
            range: { sheetId: sessionsSheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.15, green: 0.4, blue: 0.85 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        },
        // Availability tab header
        {
          repeatCell: {
            range: { sheetId: availSheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.1, green: 0.6, blue: 0.45 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        },
        // Auto-resize
        {
          autoResizeDimensions: {
            dimensions: { sheetId: sessionsSheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: SESSION_HEADERS.length }
          }
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId: availSheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: AVAILABILITY_HEADERS.length }
          }
        }
      ]
    }
  });

  return newId;
}

// ═══════════════════════════════════════════════════════════════
// FIND ROW BY ID (for upsert)
// ═══════════════════════════════════════════════════════════════

async function findRowById(tabName, id) {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) return -1;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${tabName}'!A:A`,
    });
    const rows = res.data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === String(id)) return i + 1; // 1-based
    }
    return -1;
  } catch (e) {
    console.error(`Sessions Sheet findRowById error (${tabName}):`, e.message);
    return -1;
  }
}

// ═══════════════════════════════════════════════════════════════
// SYNC A SINGLE SESSION (upsert)
// ═══════════════════════════════════════════════════════════════

function buildSessionRow(session) {
  return [
    String(session._id),
    statusEmoji(session.status),
    formatDate(session.scheduledDate),
    formatTime(session.scheduledTime),
    formatTime(session.scheduledEndTime),
    session.counselor?.name || '',
    session.counselor?.email || '',
    session.counselor?.phone || '',
    session.student?.name || '',
    session.student?.email || '',
    session.student?.phone || '',
    session.student?.grade != null ? String(session.student.grade) : '',
    session.student?.school || '',
    session.meetLink || '',
    session.counselorNotes || '',
    formatDateTime(session.createdAt),
    session.completedAt ? formatDateTime(session.completedAt) : '',
    formatDateTime(new Date()),
  ];
}

async function syncSession(session) {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) return;

  try {
    // Always re-populate with full fields to ensure complete data in sheet
    if (session.populate) {
      await session.populate('student', 'name email phone grade school');
      await session.populate('counselor', 'name email phone');
    }

    const rowData = buildSessionRow(session);
    const existingRow = await findRowById(TABS.SESSIONS, String(session._id));

    if (existingRow > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${TABS.SESSIONS}'!A${existingRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [rowData] }
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${TABS.SESSIONS}'!A:R`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [rowData] }
      });
    }

    console.log(`📊 Sessions Sheet synced: ${session._id} (${session.status})`);
  } catch (error) {
    console.error('📊 Sessions Sheet sync error (non-fatal):', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// SYNC A SINGLE AVAILABILITY SLOT (upsert)
// ═══════════════════════════════════════════════════════════════

function buildAvailabilityRow(slot) {
  return [
    String(slot._id),
    slot.counselor?.name || '',
    slot.counselor?.email || '',
    formatDate(slot.date),
    formatTime(slot.startTime),
    formatTime(slot.endTime),
    slot.isBooked ? '✅ Yes' : '❌ No',
    slot.bookedBy?.name || '',
    slot.session ? String(slot.session) : '',
    formatDateTime(slot.createdAt),
  ];
}

async function syncAvailability(slot) {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) return;

  try {
    // Populate if needed
    if (slot.populate && !slot.counselor?.name) {
      await slot.populate('counselor bookedBy');
    }

    const rowData = buildAvailabilityRow(slot);
    const existingRow = await findRowById(TABS.AVAILABILITY, String(slot._id));

    if (existingRow > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${TABS.AVAILABILITY}'!A${existingRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [rowData] }
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${TABS.AVAILABILITY}'!A:J`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [rowData] }
      });
    }

    console.log(`📊 Availability Sheet synced: ${slot._id} (booked: ${slot.isBooked})`);
  } catch (error) {
    console.error('📊 Availability Sheet sync error (non-fatal):', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// FULL SYNC — Dump everything from DB → Sheet
// ═══════════════════════════════════════════════════════════════

async function fullSync() {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) throw new Error('Sessions Sheet API not ready');

  const Session = require('../models/Session');
  const CounselorAvailability = require('../models/CounselorAvailability');

  // ── Sessions ──
  const sessions = await Session.find()
    .populate('student', 'name email phone grade school')
    .populate('counselor', 'name email phone')
    .sort({ scheduledDate: -1 })
    .lean();

  const sessionRows = sessions.map(s => buildSessionRow(s));

  // Clear existing data (keep headers)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: `'${TABS.SESSIONS}'!A2:R`,
  });

  if (sessionRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${TABS.SESSIONS}'!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: sessionRows }
    });
  }

  // ── Availability ──
  const slots = await CounselorAvailability.find()
    .populate('counselor', 'name email')
    .populate('bookedBy', 'name')
    .sort({ date: -1, startTime: 1 })
    .lean();

  const availRows = slots.map(s => buildAvailabilityRow(s));

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: `'${TABS.AVAILABILITY}'!A2:J`,
  });

  if (availRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${TABS.AVAILABILITY}'!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: availRows }
    });
  }

  console.log(`📊 Sessions full sync: ${sessionRows.length} sessions, ${availRows.length} slots`);
  return { sessions: sessionRows.length, availabilitySlots: availRows.length };
}

// ═══════════════════════════════════════════════════════════════
// FIRE-AND-FORGET WRAPPERS (safe for use in routes)
// ═══════════════════════════════════════════════════════════════

function syncSessionBackground(session) {
  if (!session) return;
  setImmediate(async () => {
    try { await syncSession(session); } 
    catch (err) { console.error('📊 Session sheet bg error:', err.message); }
  });
}

function syncAvailabilityBackground(slot) {
  if (!slot) return;
  setImmediate(async () => {
    try { await syncAvailability(slot); } 
    catch (err) { console.error('📊 Availability sheet bg error:', err.message); }
  });
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

/**
 * Read all data from both tabs of the Sessions tracker sheet.
 * Returns { sessions: { headers, rows }, availability: { headers, rows } }
 */
async function readAllData() {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();
  if (!sheets || !sheetId) throw new Error('Sessions Sheet API not ready');

  const [sessionsRes, availRes] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${TABS.SESSIONS}'!A1:R`,
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${TABS.AVAILABILITY}'!A1:J`,
    }),
  ]);

  const sessionsAll = sessionsRes.data.values || [];
  const availAll = availRes.data.values || [];

  return {
    sessions: {
      headers: sessionsAll.length > 0 ? sessionsAll[0] : SESSION_HEADERS,
      rows: sessionsAll.slice(1),
    },
    availability: {
      headers: availAll.length > 0 ? availAll[0] : AVAILABILITY_HEADERS,
      rows: availAll.slice(1),
    },
  };
}

module.exports = {
  getSpreadsheetId,
  setSpreadsheetId,
  createSessionsSheet,
  syncSession,
  syncAvailability,
  syncSessionBackground,
  syncAvailabilityBackground,
  fullSync,
  readAllData,
};
