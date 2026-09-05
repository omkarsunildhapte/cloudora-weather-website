import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleFeedback } from './feedback';
import { Env } from '../lib/email';

/**
 * Unlike the contact form, this route is called cross-origin — the app POSTs
 * from a Capacitor WebView — so every response, including each rejection, has
 * to carry the CORS headers. A 400 without them reaches the app as an opaque
 * network failure rather than the validation message it actually is, which is
 * the failure mode these tests exist to catch.
 *
 * sendMail is mocked; its own behaviour is covered in worker/lib/email.spec.ts.
 */

// vi.hoisted, because vi.mock is lifted above every const in this file and the
// factory below reads sendMail eagerly when it spreads it over the real module.
const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock('../lib/email', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/email')>();
  return { ...actual, sendMail };
});

const ENV: Env = { RESEND_API_KEY: 're_test' };

const VALID = { rating: 4, category: 'bug', message: 'The radar timeline sticks on the last frame.' };

const request = (body: unknown, init: RequestInit = {}) =>
  new Request('https://cloudora-weather.app/api/feedback', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
  });

/** The OutgoingMail the route handed to sendMail on its first call. */
const sentMail = () => sendMail.mock.calls[0][1];

const hasCors = (res: Response) => res.headers.get('Access-Control-Allow-Origin') === '*';

beforeEach(() => {
  sendMail.mockReset();
  sendMail.mockResolvedValue(undefined);
});

describe('handleFeedback', () => {
  it('sends a valid submission and answers ok', async () => {
    const res = await handleFeedback(request(VALID), ENV);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('answers the preflight, without which the app never sends the real request', async () => {
    const res = await handleFeedback(
      new Request('https://cloudora-weather.app/api/feedback', { method: 'OPTIONS' }),
      ENV,
    );
    expect(res.status).toBe(204);
    expect(hasCors(res)).toBe(true);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('rejects anything but POST', async () => {
    const res = await handleFeedback(new Request('https://cloudora-weather.app/api/feedback'), ENV);
    expect(res.status).toBe(405);
    expect(hasCors(res)).toBe(true);
  });

  describe('validation', () => {
    const rejects = async (payload: unknown, fragment: string) => {
      const res = await handleFeedback(request(payload), ENV);
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        ok: false,
        error: expect.stringContaining(fragment),
      });
      expect(sendMail).not.toHaveBeenCalled();
      // A rejection the app cannot read is indistinguishable from being offline.
      expect(hasCors(res)).toBe(true);
    };

    it('rejects a rating below the scale', () => rejects({ ...VALID, rating: 0 }, 'between 1 and 5'));
    it('rejects a rating above the scale', () => rejects({ ...VALID, rating: 6 }, 'between 1 and 5'));
    it('rejects a fractional rating', () => rejects({ ...VALID, rating: 3.5 }, 'between 1 and 5'));
    it('rejects a missing rating', () => rejects({ category: 'bug', message: VALID.message }, 'between 1 and 5'));
    it('rejects a non-numeric rating', () => rejects({ ...VALID, rating: 'five' }, 'between 1 and 5'));
    it('rejects a category outside the known set', () => rejects({ ...VALID, category: 'other' }, 'category'));
    it('rejects a message shorter than 5 characters', () => rejects({ ...VALID, message: 'no' }, 'between 5'));
    it('rejects a message longer than 600 characters', () => rejects({ ...VALID, message: 'x'.repeat(601) }, 'between 5'));

    it('accepts a numeric string rating, which is what a form control emits', async () => {
      const res = await handleFeedback(request({ ...VALID, rating: '4' }), ENV);
      expect(res.status).toBe(200);
    });

    it('accepts every category the app offers', async () => {
      for (const category of ['general', 'bug', 'feature', 'design', 'performance']) {
        sendMail.mockClear();
        const res = await handleFeedback(request({ ...VALID, category }), ENV);
        expect(res.status).toBe(200);
        expect(sendMail).toHaveBeenCalledTimes(1);
      }
    });

    it('treats a malformed body as empty and answers 400, not 500', async () => {
      const res = await handleFeedback(request('{not json'), ENV);
      expect(res.status).toBe(400);
    });

    it('trims before measuring, so padding cannot smuggle a short message through', async () => {
      const res = await handleFeedback(request({ ...VALID, message: '     ok     ' }), ENV);
      expect(res.status).toBe(400);
    });
  });

  describe('the email it builds', () => {
    it('puts the rating and category in the subject, so the inbox sorts itself', async () => {
      await handleFeedback(request(VALID), ENV);
      expect(sentMail().subject).toBe('[Cloudora Weather Feedback] Bug Report — 4★');
    });

    it('replies to support, since the in-app form collects no address to answer', async () => {
      await handleFeedback(request(VALID), ENV);
      expect(sentMail().replyTo).toBe('support@vernokasoftwaretechnology.com');
    });

    it('escapes the message before it reaches the HTML body', async () => {
      await handleFeedback(request({ ...VALID, message: '<img src=x onerror=alert(1)>' }), ENV);
      expect(sentMail().html).not.toContain('<img src=x');
      expect(sentMail().html).toContain('&lt;img src=x');
    });

    it('renders newlines as line breaks rather than collapsing the message', async () => {
      await handleFeedback(request({ ...VALID, message: 'first line\nsecond line' }), ENV);
      expect(sentMail().html).toContain('first line<br>second line');
    });

    it('draws the rating as filled and empty stars out of five', async () => {
      await handleFeedback(request({ ...VALID, rating: 2 }), ENV);
      expect(sentMail().html).toContain('★★☆☆☆');
    });

    it('prefers FEEDBACK_TO_EMAIL over the contact inbox', async () => {
      await handleFeedback(request(VALID), {
        ...ENV,
        FEEDBACK_TO_EMAIL: 'feedback@example.com',
        CONTACT_TO_EMAIL: 'contact@example.com',
      });
      expect(sentMail().to).toBe('feedback@example.com');
    });

    it('falls back to the contact inbox, then to support', async () => {
      await handleFeedback(request(VALID), { ...ENV, CONTACT_TO_EMAIL: 'contact@example.com' });
      expect(sentMail().to).toBe('contact@example.com');

      sendMail.mockClear();
      await handleFeedback(request(VALID), ENV);
      expect(sentMail().to).toBe('support@vernokasoftwaretechnology.com');
    });
  });

  describe('failure modes', () => {
    it('answers 500 with CORS when the mail secret is missing', async () => {
      const res = await handleFeedback(request(VALID), {});
      expect(res.status).toBe(500);
      expect(hasCors(res)).toBe(true);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('answers 500 rather than throwing when the send fails', async () => {
      sendMail.mockRejectedValueOnce(new Error('Resend rejected the message'));
      const res = await handleFeedback(request(VALID), ENV);
      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        ok: false,
        error: 'Something went wrong sending your feedback.',
      });
      expect(hasCors(res)).toBe(true);
    });

    it('does not leak the upstream error text — it can carry the API key', async () => {
      sendMail.mockRejectedValueOnce(new Error('invalid_api_key re_live_abc123'));
      const res = await handleFeedback(request(VALID), ENV);
      await expect(res.text()).resolves.not.toContain('re_live_abc123');
    });
  });

  describe('guards', () => {
    it('answers 429 with CORS when the limiter rejects', async () => {
      const env = { ...ENV, MAIL_LIMIT: { limit: vi.fn().mockResolvedValue({ success: false }) } };
      const res = await handleFeedback(request(VALID), env);
      expect(res.status).toBe(429);
      expect(hasCors(res)).toBe(true);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('fails open when the limiter binding throws, rather than losing the report', async () => {
      const env = { ...ENV, MAIL_LIMIT: { limit: vi.fn().mockRejectedValue(new Error('binding down')) } };
      const res = await handleFeedback(request(VALID), env);
      expect(res.status).toBe(200);
      expect(sendMail).toHaveBeenCalledTimes(1);
    });

    it('rejects an oversized body before spending any quota on it', async () => {
      const res = await handleFeedback(
        request(VALID, { headers: { 'Content-Length': String(512 * 1024) } }),
        ENV,
      );
      expect(res.status).toBe(413);
      expect(hasCors(res)).toBe(true);
      expect(sendMail).not.toHaveBeenCalled();
    });
  });
});
