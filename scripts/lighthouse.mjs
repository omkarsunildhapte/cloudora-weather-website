#!/usr/bin/env node
/**
 * Runs Lighthouse against the prerendered production build and reports
 * Core Web Vitals / SEO / accessibility scores for a fixed set of routes.
 *
 * Always builds first, then serves `dist/cloudora-weather-website/browser` as
 * plain static files (no dev server, no CSR-only shell) — this is what a
 * real crawler and a real visitor's first paint actually see, which is the
 * whole point per `.agents/seo-rules.md` Rule 2 and Rule 8.
 *
 * Usage: node scripts/lighthouse.mjs [route ...]
 *   No args  -> audits the default route set below.
 *   Args     -> audits exactly those routes instead (e.g. "/" "/features/").
 *
 * Reports (JSON + HTML) are written to lighthouse-reports/, gitignored.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const browserDist = path.join(root, 'dist', 'cloudora-weather-website', 'browser');
const reportsDir = path.join(root, 'lighthouse-reports');
const port = 4319;

const DEFAULT_ROUTES = ['/', '/features/', '/contact/'];
const routes = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_ROUTES;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`)),
    );
  });
}

// Lighthouse's own report generation always finishes before it hands off to
// chrome-launcher's post-run cleanup (deleting Chrome's temp profile dir) —
// on Windows that rmSync intermittently EPERMs (AV/indexer holding a handle
// on a file that's about to be unlinked) and crashes the CLI with a nonzero
// exit code even though the report was written correctly. So: run tolerantly
// and let the caller decide success by checking for the report file itself.
function runTolerant(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
    child.on('exit', (code) => resolve(code));
  });
}

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) reject(new Error('Static server did not come up'));
          else setTimeout(tryOnce, 300);
        });
    };
    tryOnce();
  });
}

async function main() {
  mkdirSync(reportsDir, { recursive: true });

  console.log('Building production bundle (prerendered)...');
  await run('npx', ['ng', 'build']);

  console.log(`Starting static server on :${port}...`);
  const server = spawn('npx', ['http-server', browserDist, '-p', String(port), '-s', '-c-1'], {
    shell: true,
    stdio: 'ignore',
  });
  await waitForServer(`http://localhost:${port}/`);

  const results = [];
  try {
    for (const route of routes) {
      const slug = route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-');
      const url = `http://localhost:${port}${route}`;
      const jsonPath = path.join(reportsDir, `${slug}.report.json`);
      const htmlPath = path.join(reportsDir, `${slug}.report.html`);

      console.log(`\nAuditing ${url} ...`);
      await runTolerant('npx', [
        'lighthouse',
        url,
        '--output=json,html',
        `--output-path=${path.join(reportsDir, slug)}`,
        '--chrome-flags="--headless=new --no-sandbox"',
        '--quiet',
        '--only-categories=performance,accessibility,best-practices,seo',
      ]);

      if (!existsSync(jsonPath)) {
        throw new Error(`Lighthouse produced no report for ${url} (see output above)`);
      }
      const report = JSON.parse(readFileSync(jsonPath, 'utf-8'));
      const cats = report.categories;
      results.push({
        route,
        performance: Math.round(cats.performance.score * 100),
        accessibility: Math.round(cats.accessibility.score * 100),
        bestPractices: Math.round(cats['best-practices'].score * 100),
        seo: Math.round(cats.seo.score * 100),
        lcp: report.audits['largest-contentful-paint'].displayValue,
        cls: report.audits['cumulative-layout-shift'].displayValue,
        tbt: report.audits['total-blocking-time'].displayValue,
        htmlReport: path.relative(root, htmlPath),
      });
    }
  } finally {
    server.kill();
  }

  console.log('\n=== Lighthouse summary (mobile) ===');
  console.table(
    results.map((r) => ({
      route: r.route,
      Perf: r.performance,
      A11y: r.accessibility,
      'Best Practices': r.bestPractices,
      SEO: r.seo,
      LCP: r.lcp,
      CLS: r.cls,
      TBT: r.tbt,
    })),
  );

  writeFileSync(
    path.join(reportsDir, 'summary.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  );
  console.log(`\nFull reports written to ${path.relative(root, reportsDir)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
