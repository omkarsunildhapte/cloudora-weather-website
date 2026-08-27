import { Env, SUPPORT_EMAIL, escapeHtml, isEmailConfigured, sendMail } from '../lib/email';
import { json, readJson } from '../lib/http';

/**
 * In-app feedback backend for the Cloudora Weather mobile/web app (a separate
 * origin from this site — cloudora-weather-app's FeedbackService POSTs here, see
 * src/services/feedback/feedback.service.ts in that repo). Same Resend
 * relay as the contact route, just a different payload shape: a star rating +
 * category + free-text message, no name/email (the in-app form doesn't
 * collect either, so there's no replyTo here — this is a one-way report).
 *
 * Ported from the Vercel serverless function at api/feedback.ts; validation
 * and the email template are unchanged from what shipped there.
 */

// The app calls this from a different origin (capacitor:// or https://localhost
// in the WebView), so it needs permissive CORS. '*' is acceptable for a
// write-only, unauthenticated, validated endpoint like this one.
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const CATEGORIES = ['general', 'bug', 'feature', 'design', 'performance'] as const;
type Category = (typeof CATEGORIES)[number];

const MAX_MESSAGE_LEN = 600;
const MIN_MESSAGE_LEN = 5;

const CATEGORY_LABELS: Record<Category, string> = {
  general: 'General',
  bug: 'Bug Report',
  feature: 'Feature Request',
  design: 'Design',
  performance: 'Performance',
};

interface FeedbackPayload {
  rating: number;
  category: Category;
  message: string;
}

function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

/** The one email template every in-app feedback submission renders through. */
function renderFeedbackEmail(data: {
  rating: number;
  category: Category;
  message: string;
}): string {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  const category = escapeHtml(CATEGORY_LABELS[data.category]);
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
                <span style="color:#F4FAFF; font-size:13px; display:block; margin-top:2px;">New in-app feedback</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#374151;">
                  <tr>
                    <td style="padding:6px 0; width:90px; color:#6b7280;">Rating</td>
                    <td style="padding:6px 0; font-weight:600; color:#f59e0b; letter-spacing:2px;">${stars}<span style="color:#6b7280; letter-spacing:normal; font-weight:400;"> (${data.rating}/5)</span></td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0; color:#6b7280;">Category</td>
                    <td style="padding:6px 0;">${category}</td>
                  </tr>
                </table>
                <div style="margin-top:20px; padding-top:20px; border-top:1px solid #e5e7eb; font-size:14px; line-height:1.6; color:#374151; white-space:pre-wrap;">
                  ${message}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px; background:#f9fafb; font-size:12px; color:#9ca3af;">
                Sent from the feedback form in the Cloudora Weather app · No reply-to address — this submission didn't include one.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function handleFeedback(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405, CORS_HEADERS);
  }

  const body = await readJson<FeedbackPayload>(request);
  const rating = Number(body.rating);
  const category = body.category;
  const message = (body.message ?? '').toString().trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json(
      { ok: false, error: 'Rating must be an integer between 1 and 5.' },
      400,
      CORS_HEADERS,
    );
  }
  if (!isCategory(category)) {
    return json({ ok: false, error: 'Invalid feedback category.' }, 400, CORS_HEADERS);
  }
  if (message.length < MIN_MESSAGE_LEN || message.length > MAX_MESSAGE_LEN) {
    return json(
      {
        ok: false,
        error: `Message must be between ${MIN_MESSAGE_LEN} and ${MAX_MESSAGE_LEN} characters.`,
      },
      400,
      CORS_HEADERS,
    );
  }

  if (!isEmailConfigured(env)) {
    return json({ ok: false, error: 'Email service is not configured yet.' }, 500, CORS_HEADERS);
  }

  const toEmail = env.FEEDBACK_TO_EMAIL || env.CONTACT_TO_EMAIL || SUPPORT_EMAIL;

  try {
    await sendMail(env, {
      fromName: 'Cloudora Weather App Feedback',
      to: toEmail,
      // No sender address is collected in-app, so replies go to support
      // rather than bouncing off an empty Reply-To.
      replyTo: SUPPORT_EMAIL,
      subject: `[Cloudora Weather Feedback] ${CATEGORY_LABELS[category]} — ${rating}★`,
      html: renderFeedbackEmail({ rating, category, message }),
    });

    return json({ ok: true }, 200, CORS_HEADERS);
  } catch {
    return json(
      { ok: false, error: 'Something went wrong sending your feedback.' },
      500,
      CORS_HEADERS,
    );
  }
}
