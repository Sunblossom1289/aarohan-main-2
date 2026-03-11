// backend/api/status.js
// Vercel Edge Function — lightweight sheets/contact status check.
// Returns configuration status without needing DB or Google API calls.

export const config = { runtime: 'edge' };

export default function handler(req) {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasSheetId = !!process.env.GOOGLE_SHEET_ID;
  const hasSessionsSheetId = !!process.env.GOOGLE_SESSIONS_SHEET_ID;
  const hasContactSheetId = !!process.env.GOOGLE_CONTACT_SHEET_ID;

  return new Response(
    JSON.stringify({
      success: true,
      google: {
        oauthConfigured: hasClientId && hasClientSecret,
        studentSheetConfigured: hasSheetId,
        sessionsSheetConfigured: hasSessionsSheetId,
        contactSheetConfigured: hasContactSheetId,
      },
      edge: true,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60',
      },
    }
  );
}
