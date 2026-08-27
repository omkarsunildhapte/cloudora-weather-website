import { Env, SUPPORT_EMAIL, escapeHtml, isEmailConfigured, sendMail } from '../lib/email';
import { json, readJson } from '../lib/http';

/**
 * Contact form backend. Browsers can't speak SMTP directly (it's not a
 * fetch()-able protocol, and credentials can't live in client-side JS
 * without being stolen from anyone who views source) — this Worker route
 * is the actual relay: it receives the form POST from
 * src/app/pages/contact, validates it, and sends the email via Resend
 * (see worker/lib/email.ts for the transport and required secret).
 *
 * Ported from the Vercel serverless function that lived at api/contact.ts.
 * Only the transport and request/response plumbing changed — the validation
 * rules and the email template below are byte-identical to what shipped
 * there, so delivered mail looks exactly the same.
 */

const MAX_NAME_LEN = 100;
const MAX_SUBJECT_LEN = 150;
const MAX_MESSAGE_LEN = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot — real users never fill this (it's visually hidden on the form). */
  company: string;
}

/** The one email template every contact-form submission renders through. */
function renderContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const subject = escapeHtml(data.subject || '(no subject)');
  const message = escapeHtml(data.message).replace(/\n/g, '<br>');

  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#f4f4f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
            <tr>
              <td style="background:linear-gradient(135deg,#00D9FF,#168CFF); padding:24px 28px;">
                <span style="color:#ffffff; font-size:18px; font-weight:700;">Cloudora Weather</span>
                <span style="color:#F4FAFF; font-size:13px; display:block; margin-top:2px;">New contact form message</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#374151;">
                  <tr>
                    <td style="padding:6px 0; width:90px; color:#6b7280;">From</td>
                    <td style="padding:6px 0; font-weight:600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Email</td>
                    <td style="padding:6px 0;"><a href="mailto:${email}" style="color:#0B6FD6; text-decoration:none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Subject</td>
                    <td style="padding:6px 0;">${subject}</td>
                  </tr>
                </table>
                <div style="margin-top:20px; padding-top:20px; border-top:1px solid #e5e7eb; font-size:14px; line-height:1.6; color:#374151; white-space:pre-wrap;">
                  ${message}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px; background:#f9fafb; font-size:12px; color:#9ca3af;">
                Sent from the contact form at cloudora-weather-website · Reply-To is set to the sender's address, so you can just hit reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const body = await readJson<ContactPayload>(request);
  const name = (body.name ?? '').toString().trim();
  const email = (body.email ?? '').toString().trim();
  const subject = (body.subject ?? '').toString().trim();
  const message = (body.message ?? '').toString().trim();
  const honeypot = (body.company ?? '').toString().trim();

  // Bots fill every field including hidden ones — silently "succeed" without sending.
  if (honeypot) {
    return json({ ok: true });
  }

  if (!name || name.length > MAX_NAME_LEN) {
    return json({ ok: false, error: 'Please enter a valid name.' }, 400);
  }
  if (!email || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }
  if (subject.length > MAX_SUBJECT_LEN) {
    return json({ ok: false, error: 'Subject is too long.' }, 400);
  }
  if (!message || message.length < 10 || message.length > MAX_MESSAGE_LEN) {
    return json({ ok: false, error: 'Message must be between 10 and 5000 characters.' }, 400);
  }

  if (!isEmailConfigured(env)) {
    return json({ ok: false, error: 'Email service is not configured yet.' }, 500);
  }

  const toEmail = env.CONTACT_TO_EMAIL || SUPPORT_EMAIL;

  try {
    await sendMail(env, {
      fromName: 'Cloudora Weather Contact Form',
      to: toEmail,
      // The visitor's own address, so answering is just hitting reply — the
      // email template's footer promises exactly that.
      replyTo: email,
      subject: subject
        ? `[Cloudora Weather Contact] ${subject}`
        : `[Cloudora Weather Contact] Message from ${name}`,
      html: renderContactEmail({ name, email, subject, message }),
    });

    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'Something went wrong sending your message.' }, 500);
  }
}
