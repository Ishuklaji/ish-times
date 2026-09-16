import Anthropic from "@anthropic-ai/sdk";
import { ENV } from "../config";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!ENV.anthropicKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!client) client = new Anthropic({ apiKey: ENV.anthropicKey });
  return client;
}

/**
 * Ask Claude to synthesize structured JSON strictly from the facts given in
 * `userPrompt` — the system prompt always forbids inventing facts not
 * present in the supplied material.
 */
export async function synthesizeJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: ENV.anthropicModel,
    max_tokens: 2048,
    system: `${systemPrompt}\n\nRespond with ONLY valid JSON, no markdown fences, no prose outside the JSON object.`,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Claude response did not contain JSON: ${textBlock.text.slice(0, 200)}`);
  }
  return JSON.parse(jsonMatch[0]) as T;
}
