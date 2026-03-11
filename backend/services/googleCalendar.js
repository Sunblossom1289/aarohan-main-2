// backend/services/googleCalendar.js
// Creates Google Calendar events with Google Meet conferencing
// Reuses the OAuth2 client from googleSheets.js

const { calendar: calendarFactory } = require('@googleapis/calendar');
const crypto = require('crypto');

let calendarApi = null;

/**
 * Get (or create) the Google Calendar API instance.
 * Reuses the OAuth2 client already configured for Google Sheets.
 */
async function getCalendarApi() {
  if (calendarApi) return calendarApi;

  const { getOAuth2Client, isAuthenticated } = require('./googleSheets');
  const client = await getOAuth2Client();
  const authed = await isAuthenticated();

  if (!client || !authed) {
    console.warn('⚠️  Google Calendar: OAuth not authenticated. Meet links will not be generated.');
    return null;
  }

  calendarApi = calendarFactory({ version: 'v3', auth: client });
  return calendarApi;
}

/**
 * Create a Google Calendar event with an auto-generated Google Meet link.
 *
 * @param {string} startTime - ISO 8601 start time
 * @param {string} endTime   - ISO 8601 end time
 * @param {string} summary   - Event title
 * @param {string} description - Event description
 * @param {string[]} attendeeEmails - Emails to invite (they can join Meet without knocking)
 * @returns {{ meetLink: string, eventId: string }}
 */
const createMeeting = async (startTime, endTime, summary, description, attendeeEmails = []) => {
  const calendar = await getCalendarApi();

  if (!calendar) {
    // Fallback: generate a Google Meet "new meeting" link when Calendar OAuth isn't set up
    const fallbackId = crypto.randomBytes(5).toString('hex');
    const fallbackCode = `${fallbackId.slice(0,3)}-${fallbackId.slice(3,7)}-${fallbackId.slice(7)}`;
    const meetLink = `https://meet.google.com/new`;
    console.warn('⚠️  Calendar API not available — using fallback Meet link');
    return { meetLink, eventId: null };
  }

  try {
    const requestId = crypto.randomBytes(16).toString('hex');

    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: {
        summary,
        description,
        visibility: 'public',
        guestsCanInviteOthers: true,
        guestsCanModify: false,
        anyoneCanAddSelf: true,
        attendees: attendeeEmails
          .filter(email => email)
          .map(email => ({ email })),
        start: {
          dateTime: startTime,
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: endTime,
          timeZone: 'Asia/Kolkata',
        },
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = event.data.hangoutLink || null;
    const eventId = event.data.id;

    console.log('✅ Google Meet link created:', meetLink);
    return { meetLink, eventId };
  } catch (err) {
    console.error('❌ Google Calendar event creation failed:', err.message);
    return { meetLink: null, eventId: null };
  }
};

/**
 * Delete a Google Calendar event (used when cancelling sessions).
 */
const deleteEvent = async (eventId) => {
  if (!eventId) return;
  const calendar = await getCalendarApi();
  if (!calendar) return;

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
    console.log('✅ Calendar event deleted:', eventId);
  } catch (err) {
    console.error('⚠️  Failed to delete calendar event:', err.message);
  }
};

module.exports = {
  createMeeting,
  deleteEvent,
};
