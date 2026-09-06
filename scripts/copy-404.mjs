/**
 * Copies the prerendered 404 route to `404.html` at the assets root.
 *
 * Angular writes the route to `404/index.html`, but Cloudflare's
 * `not_found_handling: "404-page"` looks for a file named exactly `404.html`
 * and will silently fall back to its own bare error page if it isn't there —
 * so this runs as part of `npm run build`, not as a manual step.
 */
import { copyFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const BROWSER_DIR = join('dist', 'cloudora-weather-website', 'browser');
const SOURCE = join(BROWSER_DIR, '404', 'index.html');
const TARGET = join(BROWSER_DIR, '404.html');

try {
  await access(SOURCE);
} catch {
  console.error(
    `copy-404: ${SOURCE} is missing — the /404 route did not prerender. ` +
      'Check app.routes.ts still declares it and that prerendering is enabled.',
  );
  process.exit(1);
}

await copyFile(SOURCE, TARGET);
console.log(`copy-404: ${SOURCE} -> ${TARGET}`);
