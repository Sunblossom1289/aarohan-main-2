// backend/middleware/sheetsSync.js
// Fire-and-forget hooks that sync student data to Google Sheets
// after key backend events. Never blocks or breaks the main flow.

const googleSheets = require('../services/googleSheets');

/**
 * Sync a student to Google Sheets (fire-and-forget).
 * Safe to call anywhere — silently no-ops if sheets aren't configured.
 *
 * @param {Object} student - Mongoose student document or plain object
 * @param {number} [sessionCount] - Optional; fetched automatically if omitted
 */
function syncStudentToSheet(student, sessionCount) {
  if (!student) return;

  // Run async but don't await — fire and forget
  setImmediate(async () => {
    try {
      await googleSheets.syncStudent(student, sessionCount);
    } catch (err) {
      console.error('📊 Sheet sync background error:', err.message);
    }
  });
}

/**
 * Express middleware generator.
 * Attach after a route handler to auto-sync the student that was just modified.
 * 
 * Usage in route:
 *   router.post('/register-step1', handler, afterSync('student'));
 *   
 * It reads res.locals[key] for the student doc, or falls back
 * to the JSON body's .student / .user field.
 */
function afterSync(localKey = 'student') {
  return (req, res, next) => {
    // Override res.json to intercept the response
    const originalJson = res.json.bind(res);
    
    res.json = function (body) {
      // Extract student from response body
      const student = body?.student || body?.user;
      if (student && body?.success !== false) {
        syncStudentToSheet(student);
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = { syncStudentToSheet, afterSync };
