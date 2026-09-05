import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleContact } from './contact';
import { Env } from '../lib/email';

/**
 * This route takes untrusted input from a public form and spends Resend quota
 * on every accepted submission, so the tests are about the gate: what it
 * refuses, what it silently absorbs, and that nothing user-supplied reaches the
 * email body unescaped.
 *
 * sendMail is mocked because the real one constructs a Resend client; its own
 * behaviour — including the throw-on-error that this route's catch depends on —
 * is covered in worker/lib/email.spec.ts.
 */

// vi.hoisted, because vi.mock is lifted above every const in this file and the
// factory below reads sendMail eagerly when it spreads it over the real module.
const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn() }));

vi.mock('../lib/email', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/email')>();
  return { ...actual, sendMail };
});

const ENV: Env = { RESEND_API_KEY: 're_test' };

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'This message is comfortably longer than ten characters.',
};

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://cloudora-weather.app/api/contact', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers,
  });

/** The OutgoingMail the route handed to sendMail on its first call. */
const sentMail = () => sendMail.mock.calls[0][1];

beforeEach(() => {
  sendMail.mockReset();
  sendMail.mockResolvedValue(undefined);
});

describe('handleContact', () => {
  it('sends a valid submission and answers ok', async () => {
    const res = await handleContact(post(VALID), ENV);
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('rejects anything but POST', async () => {
    const res = await handleContact(new Request('https://cloudora-weather.app/api/contact'), ENV);
    expect(res.status).toBe(405);
    expect(sendMail).not.toHaveBeenCalled();
  });

  describe('honeypot', () => {
    it('answers ok without sending, so a bot cannot tell it was caught', async () => {
      const res = await handleContact(post({ ...VALID, company: 'Acme Inc' }), ENV);
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ ok: true });
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('is checked before validation, so the error text gives nothing away either', async () => {
      const res = await handleContact(post({ company: 'Acme Inc' }), ENV);
      await expect(res.json()).resolves.toEqual({ ok: true });
      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    const rejects = async (payload: unknown, fragment: string) => {
      const res = await handleContact(post(payload), ENV);
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toEqual({
        ok: false,
        error: expect.stringContaining(fragment),
      });
      expect(sendMail).not.toHaveBeenCalled();
    };

    it('requires a name', () => rejects({ ...VALID, name: '   ' }, 'valid name'));
    it('caps the name at 100 characters', () => rejects({ ...VALID, name: 'a'.repeat(101) }, 'valid name'));
    it('requires an address that looks like an email', () => rejects({ ...VALID, email: 'not-an-email' }, 'valid email'));
    it('rejects an address with whitespace in it', () => rejects({ ...VALID, email: 'a b@example.com' }, 'valid email'));
    it('caps the subject at 150 characters', () => rejects({ ...VALID, subject: 'x'.repeat(151) }, 'too long'));
    it('requires a message of at least 10 characters', () => rejects({ ...VALID, message: 'too short' }, 'between 10'));
    it('caps the message at 5000 characters', () => rejects({ ...VALID, message: 'x'.repeat(5001) }, 'between 10'));

    it('treats a malformed body as empty and answers 400, not 500', async () => {
      const res = await handleContact(post('{not json'), ENV);
      expect(res.status).toBe(400);
    });

    it('accepts an empty subject — only its length is capped', async () => {
      const res = await handleContact(post({ ...VALID, subject: '' }), ENV);
      expect(res.status).toBe(200);
      expect(sentMail().subject).toBe('[Cloudora Weather Contact] Message from Ada Lovelace');
    });

    it('trims before measuring, so padding cannot smuggle a short message through', async () => {
      const res = await handleContact(post({ ...VALID, message: '   short   ' }), ENV);
      expect(res.status).toBe(400);
    });
  });

  describe('the email it builds', () => {
    it('sets Reply-To to the visitor, which the template footer promises', async () => {
      await handleContact(post(VALID), ENV);
      expect(sentMail().replyTo).toBe('ada@example.com');
    });

    it('prefixes the subject so the inbox can filter on it', async () => {
      await handleContact(post(VALID), ENV);
      expect(sentMail().subject).toBe('[Cloudora Weather Contact] Hello');
    });

    it('escapes user input before it reaches the HTML body', async () => {
      await handleContact(post({ ...VALID, name: '<script>alert(1)</script>' }), ENV);
      expect(sentMail().html).not.toContain('<script>alert(1)</script>');
      expect(sentMail().html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('escapes the address too, which is interpolated into a mailto: href', async () => {
      await handleContact(post({ ...VALID, email: 'ada"x@example.com' }), ENV);
      expect(sentMail().html).not.toContain('ada"x@example.com');
      expect(sentMail().html).toContain('ada&quot;x@example.com');
    });

    it('renders newlines as line breaks rather than collapsing the message', async () => {
      await handleContact(post({ ...VALID, message: 'line one\nline two here' }), ENV);
      expect(sentMail().html).toContain('line one<br>line two here');
    });

    it('falls back to the support inbox when no recipient is configured', async () => {
      await handleContact(post(VALID), ENV);
      expect(sentMail().to).toBe('support@vernokasoftwaretechnology.com');
    });

    it('honours CONTACT_TO_EMAIL when it is set', async () => {
      await handleContact(post(VALID), { ...ENV, CONTACT_TO_EMAIL: 'inbox@example.com' });
      expect(sentMail().to).toBe('inbox@example.com');
    });
  });

  describe('failure modes', () => {
    it('answers 500 with a real message when the mail secret is missing', async () => {
      const res = await handleContact(post(VALID), {});
      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        ok: false,
        error: 'Email service is not configured yet.',
      });
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('answers 500 rather than throwing when the send fails', async () => {
      sendMail.mockRejectedValueOnce(new Error('Resend rejected the message'));
      const res = await handleContact(post(VALID), ENV);
      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({
        ok: false,
        error: 'Something went wrong sending your message.',
      });
    });

    it('does not leak the upstream error text — it can carry the API key', async () => {
      sendMail.mockRejectedValueOnce(new Error('invalid_api_key re_live_abc123'));
      const res = await handleContact(post(VALID), ENV);
      await expect(res.text()).resolves.not.toContain('re_live_abc123');
    });
  });

  describe('guards', () => {
    it('answers 429 without sending when the limiter rejects', async () => {
      const env = { ...ENV, MAIL_LIMIT: { limit: vi.fn().mockResolvedValue({ success: false }) } };
      const res = await handleContact(post(VALID), env);
      expect(res.status).toBe(429);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('fails open when the limiter binding throws, rather than taking the form down', async () => {
      const env = { ...ENV, MAIL_LIMIT: { limit: vi.fn().mockRejectedValue(new Error('binding down')) } };
      const res = await handleContact(post(VALID), env);
      expect(res.status).toBe(200);
      expect(sendMail).toHaveBeenCalledTimes(1);
    });

    it('rejects an oversized body before spending any quota on it', async () => {
      const res = await handleContact(post(VALID, { 'Content-Length': String(512 * 1024) }), ENV);
      expect(res.status).toBe(413);
      expect(sendMail).not.toHaveBeenCalled();
    });
  });
});
