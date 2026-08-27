import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleAi } from './ai';

/**
 * The Gemini-then-OpenRouter fallback used to live in the app's AiService and was
 * tested there. It moved here along with the keys, so its coverage moves too.
 */

const post = (body: unknown) =>
  new Request('https://cloudora-weather.app/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const geminiOk = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });

const openRouterOk = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });

const KEYS = { GEMINI_API_KEY: 'gem-test', OPENROUTER_API_KEY: 'or-test' };

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('handleAi', () => {
  it('asks Gemini first and returns its text', async () => {
    fetchMock.mockResolvedValueOnce(geminiOk('  Sunny and warm in Mumbai.  '));

    const res = await handleAi(post({ prompt: 'Weather in Mumbai' }), KEYS);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, text: 'Sunny and warm in Mumbai.' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
    // The key travels to the provider, never back to the caller.
    expect(fetchMock.mock.calls[0][0]).toContain('key=gem-test');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it("falls back to OpenRouter's free models when Gemini fails", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
      .mockResolvedValueOnce(openRouterOk('Light linen shirt and shorts.'));

    const res = await handleAi(post({ prompt: 'What should I wear?' }), KEYS);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, text: 'Light linen shirt and shorts.' });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(init.headers.Authorization).toBe('Bearer or-test');
    const body = JSON.parse(init.body);
    expect(body.models).toEqual([
      'nvidia/nemotron-3.5-lightning:free',
      'z-ai/glm-5.2:free',
      'liquid/lfm-2.5-2.6b:free',
    ]);
    expect(body.reasoning).toEqual({ exclude: true });
  });

  it('falls through when Gemini answers 200 with no usable text', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } }), { status: 200 }))
      .mockResolvedValueOnce(openRouterOk('Fallback text.'));

    const res = await handleAi(post({ prompt: 'anything' }), KEYS);

    await expect(res.json()).resolves.toEqual({ ok: true, text: 'Fallback text.' });
  });

  it('reports failure when every provider is exhausted', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));

    const res = await handleAi(post({ prompt: 'anything' }), KEYS);

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'AI connection failed.' });
  });

  it('survives a provider that throws rather than answering', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(openRouterOk('Recovered.'));

    const res = await handleAi(post({ prompt: 'anything' }), KEYS);

    await expect(res.json()).resolves.toEqual({ ok: true, text: 'Recovered.' });
  });

  it('requests JSON output when the caller asks for it', async () => {
    fetchMock.mockResolvedValueOnce(geminiOk('{"score":8}'));

    await handleAi(post({ prompt: 'mood', wantJson: true }), KEYS);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.generationConfig.responseMimeType).toBe('application/json');
  });

  it('passes a system instruction through to Gemini', async () => {
    fetchMock.mockResolvedValueOnce(geminiOk('ok'));

    await handleAi(post({ prompt: 'p', systemInstruction: 'You are terse.' }), KEYS);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.system_instruction.parts[0].text).toBe('You are terse.');
  });

  it('rejects an empty prompt without calling a provider', async () => {
    const res = await handleAi(post({ prompt: '   ' }), KEYS);

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an oversized prompt so the route is not a free LLM endpoint', async () => {
    const res = await handleAi(post({ prompt: 'x'.repeat(2001) }), KEYS);

    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a non-POST method', async () => {
    const res = await handleAi(new Request('https://cloudora-weather.app/api/ai'), KEYS);
    expect(res.status).toBe(405);
  });

  it('answers CORS preflight without touching a provider', async () => {
    const res = await handleAi(
      new Request('https://cloudora-weather.app/api/ai', { method: 'OPTIONS' }),
      KEYS,
    );

    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails clean when no provider is configured', async () => {
    const res = await handleAi(post({ prompt: 'anything' }), {});

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ ok: false, error: 'AI service is not configured.' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
