import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Env, SUPPORT_EMAIL, escapeHtml, isEmailConfigured, sendMail } from './email';

/**
 * The load-bearing behaviour here is the throw. `resend.emails.send()` resolves
 * with `{ data, error }` and does NOT reject when the API rejects the message —
 * a bad key or an unverified domain arrives as a populated `error` on an
 * otherwise successful promise. Without sendMail turning that into a throw,
 * both routes would answer `{ ok: true }` for mail that was never delivered.
 */

const send = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    readonly emails = { send };
    constructor(readonly key?: string) {
      constructedWith.push(key);
    }
  },
}));

const constructedWith: (string | undefined)[] = [];

const MAIL = {
  fromName: 'Cloudora Weather Contact Form',
  to: 'support@vernokasoftwaretechnology.com',
  replyTo: 'visitor@example.com',
  subject: '[Cloudora Weather Contact] Hello',
  html: '<p>hi</p>',
};

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
  constructedWith.length = 0;
});

describe('isEmailConfigured', () => {
  it('is true once the Worker secret is present', () => {
    expect(isEmailConfigured({ RESEND_API_KEY: 're_test' })).toBe(true);
  });

  it('is false when the secret is missing, so the routes fail clean rather than silently', () => {
    expect(isEmailConfigured({})).toBe(false);
  });

  it('is false for an empty string, which is what an unset dashboard variable looks like', () => {
    expect(isEmailConfigured({ RESEND_API_KEY: '' })).toBe(false);
  });
});

describe('escapeHtml', () => {
  it('neutralises a script tag pasted into a form field', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes quotes, so a value cannot break out of an attribute', () => {
    expect(escapeHtml(`" onload="x`)).toBe('&quot; onload=&quot;x');
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('escapes ampersands first, so an escape is not itself double-escaped into nonsense', () => {
    expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });

  it('leaves ordinary text alone', () => {
    expect(escapeHtml('Pune, India — 23°C')).toBe('Pune, India — 23°C');
  });
});

describe('sendMail', () => {
  const env: Env = { RESEND_API_KEY: 're_test' };

  it('builds the client from the request env, not module scope — a Worker has no process.env', async () => {
    await sendMail(env, MAIL);
    expect(constructedWith).toEqual(['re_test']);
  });

  it('sends from the verified default domain when MAIL_FROM is unset', async () => {
    await sendMail(env, MAIL);
    expect(send.mock.calls[0][0].from).toBe('Cloudora Weather Contact Form <noreply@vernokasoftwaretechnology.com>');
  });

  it('honours a MAIL_FROM override while keeping the display name', async () => {
    await sendMail({ ...env, MAIL_FROM: 'hello@vernokasoftwaretechnology.com' }, MAIL);
    expect(send.mock.calls[0][0].from).toBe('Cloudora Weather Contact Form <hello@vernokasoftwaretechnology.com>');
  });

  it('passes the recipient, reply-to, subject and body through unchanged', async () => {
    await sendMail(env, MAIL);
    expect(send.mock.calls[0][0]).toMatchObject({
      to: [MAIL.to],
      replyTo: MAIL.replyTo,
      subject: MAIL.subject,
      html: MAIL.html,
    });
  });

  it('throws when Resend reports an error on an otherwise resolved promise', async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: 'validation_error', message: 'Domain not verified' } });
    await expect(sendMail(env, MAIL)).rejects.toThrow(/Domain not verified/);
  });

  it('names the failure so the Worker log says which send failed and why', async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: 'invalid_api_key', message: 'API key is invalid' } });
    await expect(sendMail(env, MAIL)).rejects.toThrow(/invalid_api_key/);
  });

  it('resolves quietly on success', async () => {
    await expect(sendMail(env, MAIL)).resolves.toBeUndefined();
  });
});

describe('SUPPORT_EMAIL', () => {
  it('is the address both routes fall back to when no recipient is configured', () => {
    expect(SUPPORT_EMAIL).toBe('support@vernokasoftwaretechnology.com');
  });
});
