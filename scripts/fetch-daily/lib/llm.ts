import { ENV } from "../config";

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Free-tier Gemini quotas are per-minute-per-model (as low as 5 RPM on the
// flagship models), and this pipeline fires ~25 sequential calls per run —
// so every call is paced to stay under that, on top of retrying on 429/503.
const MIN_CALL_SPACING_MS = 13_000;
let lastCallAt = 0;

async function pace(): Promise<void> {
  const wait = lastCallAt + MIN_CALL_SPACING_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();
}

function retryDelayFromBody(body: string): number | undefined {
  const match = body.match(/"retryDelay":\s*"(\d+)s"/);
  return match ? Number(match[1]) * 1000 : undefined;
}

/**
 * Ask Gemini (free tier via Google AI Studio — no billing required) to
 * synthesize structured JSON strictly from the facts given in `userPrompt`.
 * The system prompt always forbids inventing facts not present in the
 * supplied material.
 */
export async function synthesizeJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  if (!ENV.geminiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${ENV.geminiModel}:generateContent?key=${ENV.geminiKey}`;
  const maxAttempts = 4;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await pace();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${systemPrompt}\n\nRespond with ONLY valid JSON, no markdown fences, no prose outside the JSON object.` }],
        },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      lastError = new Error(`Gemini HTTP ${res.status}: ${body}`);
      // 429 (rate/quota) and 503 (transient overload) are worth retrying; anything
      // else (bad key, bad model, blocked prompt) will just fail the same way again.
      if ((res.status === 429 || res.status === 503) && attempt < maxAttempts) {
        const delay = retryDelayFromBody(body) ?? attempt * 5_000;
        await sleep(delay);
        continue;
      }
      throw lastError;
    }

    const data = (await res.json()) as GeminiResponse;
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the prompt: ${data.promptFeedback.blockReason}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No text content in Gemini response");
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Gemini response did not contain JSON: ${text.slice(0, 200)}`);
    }
    return JSON.parse(jsonMatch[0]) as T;
  }

  throw lastError;
}
