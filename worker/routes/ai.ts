import { json, readJson } from '../lib/http';
import { CORS_HEADERS, preflight } from '../lib/cors';

/**
 * LLM proxy for the Cloudora Weather app.
 *
 * The provider keys used to be compiled into the app bundle, where anyone could
 * read them out of the shipped JavaScript and spend the quota. They are Worker
 * secrets now, and the routing that used to live in the app's AiService lives
 * here instead:
 *
 *  1. Google Gemini's free tier (~15 req/min).
 *  2. OpenRouter's $0 models on failure — three are listed so OpenRouter falls
 *     through to the next when a shared free pool is rate-limited.
 *
 * Nothing here bills per token, so the exposure this closes is quota theft
 * rather than a direct bill. That still matters: a drained free quota takes the
 * feature down for every real user.
 */

export interface AiEnv {
  GEMINI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
}

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_FREE_MODELS = [
  'nvidia/nemotron-3.5-lightning:free',
  'z-ai/glm-5.2:free',
  'liquid/lfm-2.5-2.6b:free',
];

const TEMPERATURE = 0.8;
const MAX_TOKENS = 500;
const SITE_URL = 'https://cloudora-weather.app';
const SITE_NAME = 'Cloudora Weather';

// The app's longest prompt is a few hundred characters. These caps stop the
// route being used as a general-purpose LLM endpoint on someone else's quota.
const MAX_PROMPT_LEN = 2000;
const MAX_SYSTEM_LEN = 500;

interface AskPayload {
  prompt: string;
  systemInstruction?: string;
  wantJson?: boolean;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  promptFeedback?: { blockReason?: string };
}

interface ChatCompletionResponse {
  choices?: { message: { content: string } }[];
}

export async function handleAi(request: Request, env: AiEnv): Promise<Response> {
  if (request.method === 'OPTIONS') return preflight();
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405, CORS_HEADERS);
  }

  const body = await readJson<AskPayload>(request);
  const prompt = (body.prompt ?? '').toString().trim();
  const systemInstruction = (body.systemInstruction ?? '').toString().trim();
  const wantJson = body.wantJson === true;

  if (!prompt) {
    return json({ ok: false, error: 'A prompt is required.' }, 400, CORS_HEADERS);
  }
  if (prompt.length > MAX_PROMPT_LEN || systemInstruction.length > MAX_SYSTEM_LEN) {
    return json({ ok: false, error: 'Prompt is too long.' }, 413, CORS_HEADERS);
  }
  if (!env.GEMINI_API_KEY && !env.OPENROUTER_API_KEY) {
    return json({ ok: false, error: 'AI service is not configured.' }, 500, CORS_HEADERS);
  }

  if (env.GEMINI_API_KEY) {
    const text = await askGemini(env.GEMINI_API_KEY, prompt, systemInstruction, wantJson);
    if (text) return json({ ok: true, text }, 200, CORS_HEADERS);
  }
  if (env.OPENROUTER_API_KEY) {
    const text = await askOpenRouter(env.OPENROUTER_API_KEY, prompt, systemInstruction, wantJson);
    if (text) return json({ ok: true, text }, 200, CORS_HEADERS);
  }

  return json({ ok: false, error: 'AI connection failed.' }, 502, CORS_HEADERS);
}

/** Returns the generated text, or null so the caller can fall through. */
async function askGemini(
  key: string,
  prompt: string,
  systemInstruction: string,
  wantJson: boolean,
): Promise<string | null> {
  const payload = {
    ...(systemInstruction ? { system_instruction: { parts: [{ text: systemInstruction }] } } : {}),
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: TEMPERATURE,
      maxOutputTokens: MAX_TOKENS,
      ...(wantJson ? { responseMimeType: 'application/json' } : {}),
    },
  };

  try {
    const res = await fetch(`${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GeminiResponse;
    const text =
      data.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('').trim() ?? '';
    return text || null;
  } catch {
    return null;
  }
}

async function askOpenRouter(
  key: string,
  prompt: string,
  systemInstruction: string,
  wantJson: boolean,
): Promise<string | null> {
  const messages = [
    ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
    {
      role: 'user',
      content: wantJson && !/json/i.test(prompt) ? `${prompt}\n\nOutput strictly valid JSON.` : prompt,
    },
  ];

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
      },
      body: JSON.stringify({
        models: OPENROUTER_FREE_MODELS,
        messages,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        reasoning: { exclude: true },
        ...(wantJson ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ChatCompletionResponse;
    return data.choices?.[0]?.message.content.trim() || null;
  } catch {
    return null;
  }
}
