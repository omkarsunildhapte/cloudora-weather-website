/** A visitor's answer to the analytics consent banner. Values double as the
 *  `analytics_storage` states Google Consent Mode v2 expects, so they can be
 *  passed straight to gtag('consent', 'update', …). */
export type ConsentDecision = 'granted' | 'denied';
