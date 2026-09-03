import { json } from './http';

/**
 * Abuse guards for the proxy routes.
 *
 * /api/ai, /api/owm and /api/tiles front provider keys with no authentication,
 * so without a limit anyone could loop against them and drain the free quotas —
 * which takes the feature down for every real user. Cloudflare's rate-limiting
 * binding provides the counters without needing Durable Objects.
 *
 * Be aware the binding is approximate: it counts per colo and is eventually
 * consistent, so a burst can exceed the nominal ceiling several times over
 * before it starts rejecting. It stops a naive loop; it is not an exact cap.
 * Durable Objects are the alternative when exactness matters.
 */

/** Cloudflare's rate-limiting binding. */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Caller identity for rate limiting. CF-Connecting-IP is set by Cloudflare's
 * edge and cannot be spoofed by the client — unlike X-Forwarded-For, which is
 * attacker-controlled and must never be trusted for this.
 */
export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

/**
 * Applies a per-IP limit, returning a 429 when exceeded and null when the
 * request may proceed. Fails OPEN when the binding is missing or throws: a
 * broken limiter should not take the endpoint down with it.
 */
export async function rateLimited(
  limiter: RateLimiter | undefined,
  request: Request,
  headers: Record<string, string> = {},
): Promise<Response | null> {
  if (!limiter) return null;
  try {
    const { success } = await limiter.limit({ key: clientIp(request) });
    if (success) return null;
  } catch {
    return null;
  }
  return json(
    { ok: false, error: "You're sending requests too quickly. Try again in a moment." },
    429,
    { 'Retry-After': '60', ...headers },
  );
}

/**
 * Ceiling for a request body. The AI route's own prompt caps are far below
 * this; the limit exists so a large upload can't burn Worker CPU before those
 * checks ever run.
 */
export const MAX_BODY_BYTES = 256 * 1024;

/**
 * Cheap pre-filter on the declared length. A client can omit Content-Length by
 * sending chunked, so this alone is not a guarantee — `readJsonCapped` below
 * enforces the real limit on what actually arrives.
 */
export function tooLarge(request: Request, headers: Record<string, string> = {}): Response | null {
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Request body is too large.' }, 413, headers);
  }
  return null;
}

/**
 * Reads a JSON body, enforcing MAX_BODY_BYTES against the bytes actually
 * received rather than the header the client claimed. Returns the parsed value,
 * or a Response to return as-is when the body is oversized.
 *
 * Unparseable JSON yields {} so per-field validation produces a clean 400
 * rather than a 500 — matching readJson's behaviour.
 */
export async function readJsonCapped<T>(
  request: Request,
  headers: Record<string, string> = {},
): Promise<{ body: Partial<T> } | { response: Response }> {
  let text: string;
  try {
    text = await request.text();
  } catch {
    return { body: {} as Partial<T> };
  }

  // TextEncoder measures UTF-8 bytes; text.length would count UTF-16 units and
  // undercount anything outside the BMP.
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return { response: json({ ok: false, error: 'Request body is too large.' }, 413, headers) };
  }

  try {
    return { body: (JSON.parse(text) ?? {}) as Partial<T> };
  } catch {
    return { body: {} as Partial<T> };
  }
}
