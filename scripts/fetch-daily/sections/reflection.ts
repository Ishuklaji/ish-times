import { synthesizeJson } from "../lib/llm";
import type { ReflectionBody } from "../../../lib/types";

export async function fetchReflectionSectionData(
  usedConcepts: string[],
  todaysStories: { title: string; summary: string }[],
): Promise<ReflectionBody> {
  return synthesizeJson<ReflectionBody>(
    "You write 'Today's Reflection', a Speaking-Tree-style column naming one real Sanskrit, Vedantic, or Buddhist concept and connecting it genuinely to today's news. Never invent a concept — use a real, recognized term.",
    `Concepts already used before (never reuse any of these): ${usedConcepts.join(", ") || "none yet"}\n\n` +
      `Today's stories:\n${todaysStories.map((s) => `- ${s.title}: ${s.summary}`).join("\n")}\n\n` +
      `Pick ONE real concept not in the used list. Explain it in 2-3 sentences. Then connect it genuinely to 2-3 of today's actual stories above (name them).\n\n` +
      `Return JSON: {"concept": "...", "explanation": "...", "connections": ["...", "...", "..."]}`,
  );
}
