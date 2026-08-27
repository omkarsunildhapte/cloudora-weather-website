/**
 * The Cloudora Weather app calls these routes from a different origin — a
 * Capacitor WebView (`capacitor://localhost` / `https://localhost`) and, in
 * development, `http://localhost:4300`. None of those can be enumerated
 * reliably, so the proxy routes answer `*`.
 *
 * That is acceptable here only because every proxied route is unauthenticated,
 * read-only against an allowlist, and carries no user data: an attacker who
 * calls them directly gains nothing they could not get by pointing at the
 * upstream API themselves. What CORS is protecting is the *key*, and the key
 * never leaves the Worker.
 */
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Preflight response shared by the proxy routes. */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
