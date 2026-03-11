// backend/services/contactSheet.js
// Google Sheets integration for the "Get in Touch" contact form.
// Reuses the same OAuth2 client from googleSheets.js
// Persists sheet ID to MongoDB so it survives serverless cold starts.

const { sheets: sheetsFactory } = require('@googleapis/sheets');
const mongoose = require('mongoose');

let sheetsApi = null;
let contactSpreadsheetId = null;

const SHEET_NAME = 'Contact Submissions';

const CONTACT_HEADERS = [
  'Timestamp',   // A
  'Name',        // B
  'Email',       // C
  'Phone',       // D
  'Message',     // E
];

// ── MongoDB persistence (reuse AppConfig model from googleSheets) ──
const DB_KEY = 'contact_sheet_id';

function getAppConfigModel() {
  // Reuse the same AppConfig model defined in googleSheets.js
  if (mongoose.models.AppConfig) return mongoose.models.AppConfig;
  const configSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    updatedAt: { type: Date, default: Date.now }
  });
  return mongoose.model('AppConfig', configSchema);
}

async function loadSheetIdFromDB() {
  try {
    const AppConfig = getAppConfigModel();
    const doc = await AppConfig.findOne({ key: DB_KEY });
    return doc ? doc.value : null;
  } catch (e) {
    console.warn('⚠️  Could not load contact sheet ID from DB:', e.message);
    return null;
  }
}

async function saveSheetIdToDB(id) {
  try {
    const AppConfig = getAppConfigModel();
    await AppConfig.findOneAndUpdate(
      { key: DB_KEY },
      { value: id, updatedAt: new Date() },
      { upsert: true }
    );
    console.log('🔄 Contact sheet ID saved to DB:', id);
  } catch (e) {
    console.error('Failed to save contact sheet ID to DB:', e.message);
  }
}

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
  // 1. In-memory cache
  if (contactSpreadsheetId) return contactSpreadsheetId;
  // 2. Environment variable
  if (process.env.GOOGLE_CONTACT_SHEET_ID) {
    contactSpreadsheetId = process.env.GOOGLE_CONTACT_SHEET_ID;
    return contactSpreadsheetId;
  }
  // 3. MongoDB (survives serverless cold starts)
  const fromDB = await loadSheetIdFromDB();
  if (fromDB) {
    contactSpreadsheetId = fromDB;
    return contactSpreadsheetId;
  }
  return null;
}

function setSpreadsheetId(id) {
  contactSpreadsheetId = id;
  // Also persist to DB
  saveSheetIdToDB(id).catch(() => {});
}

/**
 * Create a new "Contact Submissions" spreadsheet with headers + formatting.
 * Returns the spreadsheet ID.
 */
async function createContactSheet() {
  const sheets = await getSheetsApi();
  if (!sheets) throw new Error('Sheets API not authenticated');

  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'Aarohan - Contact Form Submissions' },
      sheets: [{
        properties: {
          title: SHEET_NAME,
          gridProperties: { frozenRowCount: 1 }
        }
      }]
    }
  });

  const newId = res.data.spreadsheetId;
  contactSpreadsheetId = newId;
  
  // Persist to MongoDB so we never create a duplicate
  await saveSheetIdToDB(newId);
  console.log('✅ Created contact spreadsheet:', newId);

  // Write headers
  await sheets.spreadsheets.values.update({
    spreadsheetId: newId,
    range: `'${SHEET_NAME}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [CONTACT_HEADERS] }
  });

  // Format header row (bold + colored background)
  const sheetTabId = res.data.sheets[0].properties.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: newId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: sheetTabId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.106, green: 0.286, blue: 0.396 }, // Yale blue
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId: sheetTabId, dimension: 'COLUMNS', startIndex: 0, endIndex: CONTACT_HEADERS.length }
          }
        }
      ]
    }
  });

  return newId;
}

/**
 * Append a contact form submission to the sheet.
 * @param {{ name: string, email: string, message: string }} data
 */
async function appendContactSubmission(data) {
  const sheets = await getSheetsApi();
  const sheetId = await getSpreadsheetId();

  if (!sheets || !sheetId) {
    console.warn('⚠️  Contact sheet not configured — skipping write');
    return false;
  }

  try {
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const row = [
      timestamp,
      data.name || '',
      data.email || '',
      data.phone || '',
      data.message || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${SHEET_NAME}'!A:E`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    console.log(`📬 Contact form synced: ${data.name} (${data.email})`);
    return true;
  } catch (error) {
    console.error('📬 Contact sheet write error (non-fatal):', error.message);
    return false;
  }
}

module.exports = {
  getSpreadsheetId,
  setSpreadsheetId,
  createContactSheet,
  appendContactSubmission,
};
