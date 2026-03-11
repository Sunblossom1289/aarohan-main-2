// backend/services/googleDocs.js
// Create Google Docs for session transcriptions
// Reuses the same OAuth2 client from googleSheets.js

const { docs: docsFactory } = require('@googleapis/docs');
const { drive: driveFactory } = require('@googleapis/drive');

// We import the OAuth client getter from googleSheets
// to avoid duplicating OAuth logic
let docsApi = null;

/**
 * Get (or create) the Google Docs API instance.
 * Reuses the OAuth2 client already configured for Google Sheets.
 */
async function getDocsApi() {
  if (docsApi) return docsApi;

  // Reuse the existing OAuth client from googleSheets
  const { getOAuth2Client, isAuthenticated } = require('./googleSheets');
  const client = await getOAuth2Client();
  const authed = await isAuthenticated();

  if (!client || !authed) {
    console.warn('⚠️  Google Docs: OAuth not authenticated. Skipping doc creation.');
    return null;
  }

  docsApi = docsFactory({ version: 'v1', auth: client });
  return docsApi;
}

/**
 * Get the Google Drive API (to set permissions / move docs to a folder).
 */
async function getDriveApi() {
  const { getOAuth2Client } = require('./googleSheets');
  const client = await getOAuth2Client();
  if (!client) return null;
  return driveFactory({ version: 'v3', auth: client });
}

/**
 * Create a Google Doc with the transcription content.
 *
 * @param {object} opts
 * @param {string} opts.title        - Document title
 * @param {string} opts.transcription - Full transcription text
 * @param {string} opts.studentName
 * @param {string} opts.counselorName
 * @param {string} opts.date
 * @param {string} opts.sessionId
 * @returns {{ docUrl: string, docId: string } | null}
 */
async function createTranscriptionDoc({ title, transcription, studentName, counselorName, date, sessionId }) {
  const docs = await getDocsApi();
  if (!docs) {
    console.warn('⚠️  Docs API not available — transcription will be saved in DB only');
    return null;
  }

  try {
    // 1. Create blank doc
    const createRes = await docs.documents.create({
      requestBody: { title },
    });

    const docId = createRes.data.documentId;
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

    // 2. Build the document content
    const header = `CAREER MENTORSHIP SESSION TRANSCRIPTION\n` +
      `${'═'.repeat(50)}\n` +
      `Student: ${studentName || 'N/A'}\n` +
      `Counselor: ${counselorName || 'N/A'}\n` +
      `Date: ${date || 'N/A'}\n` +
      `Session ID: ${sessionId || 'N/A'}\n` +
      `${'═'.repeat(50)}\n\n` +
      `TRANSCRIPT\n` +
      `${'─'.repeat(50)}\n\n`;

    const fullContent = header + transcription;

    // 3. Insert text into the doc
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: fullContent,
            },
          },
        ],
      },
    });

    // 4. Make the doc viewable by anyone with the link (optional)
    try {
      const drive = await getDriveApi();
      if (drive) {
        await drive.permissions.create({
          fileId: docId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      }
    } catch (permErr) {
      console.warn('⚠️  Could not set doc sharing permissions:', permErr.message);
    }

    console.log(`✅ Google Doc created: ${docUrl}`);
    return { docUrl, docId };

  } catch (err) {
    console.error('❌ Failed to create Google Doc:', err.message);
    return null;
  }
}

module.exports = { createTranscriptionDoc };
