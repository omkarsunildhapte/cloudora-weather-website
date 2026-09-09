/**
 * Are the configured OpenRouter models actually serving?
 *
 *   npm run probe:models            # the ids in worker/routes/ai.ts
 *   npm run probe:models -- --all   # every general-purpose $0 model, to pick replacements
 *
 * Why this exists: the catalogue at /api/v1/models cannot answer the question.
 * Three separate breakages came from ids that were listed, priced at zero and
 * spelled correctly while being unusable — one had left the free tier, one was
 * "only available on agentic harnesses", one returned "Provider returned
 * error". The only reliable check is a real request, so this sends the same
 * body shape worker/routes/ai.ts sends (system + user message, temperature,
 * max_tokens, reasoning excluded) and reports what came back.
 *
 * Exits non-zero when a configured model is dead, so it can gate a release.
 * Reads OPENROUTER_API_KEY from .dev.vars (gitignored) and never prints it.
 */
import { readFileSync } from 'node:fs';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CATALOGUE_URL = 'https://openrouter.ai/api/v1/models';
const SITE_URL = 'https://cloudora-weather.vernokasoftwaretechnology.com';
const SITE_NAME = 'Cloudora Weather';

/** Domain-tuned and non-text free models: health, coding agents, audio/video. */
const NOT_GENERAL_PURPOSE = /sante|-fin|code|laguna|lyria|content-safety/i;

/**
 * Ids that are routers, not models. They pick a different backend per call, so
 * one probe says nothing durable about them — a run can fail purely because the
 * router happened to choose a bad backend that time. Reported, never gated on.
 */
const ROUTERS = new Set(['openrouter/free']);

function devVars() {
  try {
    return Object.fromEntries(
      readFileSync('.dev.vars', 'utf8')
        .split('\n')
        .filter(line => line.includes('=') && !line.trimStart().startsWith('#'))
        .map(line => {
          const at = line.indexOf('=');
          return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
        }),
    );
  } catch {
    return {};
  }
}

/** The ids the Worker is actually configured with. */
function configured() {
  const src = readFileSync('worker/routes/ai.ts', 'utf8');
  const block = src.match(/OPENROUTER_FREE_MODELS\s*=\s*\[([\s\S]*?)\]/)[1];
  return [...block.matchAll(/'([^']+)'/g)].map(m => m[1]);
}

/** Every $0 model that is plausibly general-purpose, for picking replacements. */
async function candidates() {
  const res = await fetch(CATALOGUE_URL);
  const { data } = await res.json();
  return data
    .filter(m => Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0)
    .filter(m => !NOT_GENERAL_PURPOSE.test(m.id))
    .map(m => m.id);
}

async function probe(key, model) {
  const started = Date.now();
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': SITE_URL,
      'X-Title': SITE_NAME,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You write one short, friendly sentence of weather advice.' },
        { role: 'user', content: 'It is 31C, humid, 70% chance of afternoon thunderstorms. What should I do today?' },
      ],
      temperature: 0.8,
      max_tokens: 500,
      reasoning: { exclude: true },
    }),
  });
  const ms = Date.now() - started;
  const body = await res.json();
  const text = (body.choices?.[0]?.message?.content ?? '').trim().replace(/\s+/g, ' ');

  if (!res.ok || body.error) return { ok: false, ms, why: String(body?.error?.message ?? `HTTP ${res.status}`) };
  // A 200 with no content is a failure for this route's purposes: askOpenRouter
  // returns null for it and falls through to the next candidate anyway.
  if (!text) return { ok: false, ms, why: '200 but no content' };
  return { ok: true, ms, text };
}

const key = devVars().OPENROUTER_API_KEY;
if (!key) {
  console.error('No OPENROUTER_API_KEY in .dev.vars — copy it from the Worker secret.');
  process.exit(1);
}

const all = process.argv.includes('--all');
const models = all ? await candidates() : configured();
console.log(`probing ${models.length} model(s) with the real request shape\n`);

const working = [];
const dead = [];
for (const model of models) {
  try {
    const r = await probe(key, model);
    const router = ROUTERS.has(model);
    if (r.ok) {
      if (!router) working.push({ model, ms: r.ms });
      console.log(`${router ? 'ROUTER' : 'OK    '} ${model.padEnd(46)} ${String(r.ms).padStart(6)}ms  "${r.text.slice(0, 50)}…"`);
    } else if (router) {
      console.log(`ROUTER ${model.padEnd(46)} ${String(r.ms).padStart(6)}ms  ${r.why.slice(0, 60)} (advisory)`);
    } else {
      console.log(`FAIL   ${model.padEnd(46)} ${String(r.ms).padStart(6)}ms  ${r.why.slice(0, 70)}`);
      dead.push(model);
    }
  } catch (e) {
    console.log(`ERROR ${model.padEnd(46)}         ${String(e.message).slice(0, 70)}`);
  }
}

const pinned = models.filter(m => !ROUTERS.has(m)).length;
console.log(`\n${working.length}/${pinned} pinned model(s) serving. Fastest first:`);
working.sort((a, b) => a.ms - b.ms).forEach(r => console.log(`  ${String(r.ms).padStart(6)}ms  ${r.model}`));

// Only pinned ids gate. A router's result varies per call, so failing on it
// would make this flaky rather than informative.
if (!all && dead.length) {
  console.error(`\nNot serving: ${dead.join(', ')}`);
  console.error('Pick replacements with: npm run probe:models -- --all');
  process.exit(1);
}
