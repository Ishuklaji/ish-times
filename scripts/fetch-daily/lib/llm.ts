import { ENV } from "../config";

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
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
    throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);
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
