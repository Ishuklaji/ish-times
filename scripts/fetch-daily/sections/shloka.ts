import { synthesizeJson } from "../lib/anthropic";
import type { ShlokaBody } from "../../../lib/types";

export async function fetchShlokaSectionData(usedShlokas: string[]): Promise<ShlokaBody> {
  return synthesizeJson<ShlokaBody>(
    "You write 'Sanskrit Shloka': one real, well-known verse (Bhagavad Gita, Upanishads, or similar), never repeated, with a genuine word-by-word breakdown.",
    `Already used (never reuse any of these, by source citation): ${usedShlokas.join(", ") || "none yet"}\n\n` +
      `Return JSON: {"verse": "... (Devanagari or transliteration)", "source": "... (e.g. Bhagavad Gita 2.47)", "wordByWord": [{"word": "...", "meaning": "..."}], "hindiTranslation": "...", "englishTranslation": "..."}`,
  );
}
