import { Resend } from 'resend';

/**
 * Outbound email for the Cloudflare Worker, via Resend's HTTP API.
 *
 * Replaces the Gmail SMTP transport this migration first used (worker-mailer
 * over cloudflare:sockets): with a verified sending domain, mail genuinely
 * originates from vernokasoftwaretechnology.com (the Resend-verified domain shared with arithmaxa) rather than a Gmail account,
 * so there's no "Send mail as" verification to maintain and no SMTP socket to
 * keep alive inside a Worker request.
 *
 * RESEND_API_KEY is a Worker secret — `npx wrangler secret put RESEND_API_KEY`
 * or the dashboard's Variables and Secrets with Encrypt. It must never move
 * into src/environments/*, which Angular compiles into the browser bundle.
 */
export interface Env {
  RESEND_API_KEY?: string;
  /** Overrides the From address; must stay on a domain verified in Resend. */
  MAIL_FROM?: string;
  CONTACT_TO_EMAIL?: string;
  FEEDBACK_TO_EMAIL?: string;
}

/** Sending identity. Resend rejects a From on an unverified domain outright. */
const DEFAULT_FROM = 'noreply@vernokasoftwaretechnology.com';

/** Public support inbox — served by Cloudflare Email Routing on the zone. */
export const SUPPORT_EMAIL = 'support@vernokasoftwaretechnology.com';

/** Whether email is configured — gates sends so misconfiguration fails clean, not silently. */
export function isEmailConfigured(env: Env): boolean {
  return !!env.RESEND_API_KEY;
}

/** Escapes user-supplied text before it goes into an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface OutgoingMail {
  /** Display name on the From header; the address is always MAIL_FROM. */
  fromName: string;
  to: string;
  /** Where replies land — the sender for contact mail, support for feedback. */
  replyTo: string;
  subject: string;
  html: string;
}

/**
 * Sends one email, throwing on failure so each route's existing catch turns it
 * into the same 500 + JSON envelope the clients already handle.
 *
 * The throw matters: resend.emails.send() resolves with `{ data, error }` and
 * does NOT reject on an API-level failure — an unverified domain or a bad key
 * comes back as a populated `error` on an otherwise successful promise. Code
 * that only try/catches around this call reports those sends as successful.
 */
export async function sendMail(env: Env, mail: OutgoingMail): Promise<void> {
  // Constructed per request, not at module scope: a Worker has no process.env,
  // and the key only exists on the `env` handed to fetch().
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${mail.fromName} <${env.MAIL_FROM || DEFAULT_FROM}>`,
    to: [mail.to],
    replyTo: mail.replyTo,
    subject: mail.subject,
    html: mail.html,
  });

  if (error) {
    throw new Error(`Resend rejected the message: ${error.name} — ${error.message}`);
  }
}
