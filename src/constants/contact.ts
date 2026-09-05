/**
 * Contact form rules and endpoint.
 *
 * The Worker validates the same body again in `worker/routes/contact.ts` — the
 * client rules exist to give immediate feedback, not to be the gate.
 */
export const CONTACT_ENDPOINT = '/api/contact';

/** Short enough to allow a one-line question, long enough to reject "hi". */
export const MIN_MESSAGE_LENGTH = 10;

export const CONTACT_GENERIC_ERROR = 'Something went wrong — please try again.';
export const CONTACT_NETWORK_ERROR =
  'Network error — please check your connection and try again.';
