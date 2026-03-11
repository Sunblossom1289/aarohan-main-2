// backend/api/health.js
// Vercel Edge Function — responds in <10ms globally, no cold start.
// Replaces the Express /health endpoint for external monitors / preflight checks.

export const config = { runtime: 'edge' };

export default function handler(req) {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      edge: true,
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
    }
  );
}
