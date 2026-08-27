/**
 * Worker routes return a `Response` rather than mutating a `res` object the
 * way the Vercel handlers did — this keeps the JSON envelope ({ ok, error })
 * that src/app/pages/contact and cloudora-weather-app's FeedbackService already
 * parse, so the migration is invisible to both clients.
 */
export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/** Parses a JSON request body, returning {} for anything unparseable — the
 *  per-field validation below it rejects the request anyway, and this keeps a
 *  malformed body from throwing a 500 instead of a clean 400. */
export async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    return ((await request.json()) ?? {}) as Partial<T>;
  } catch {
    return {};
  }
}
