import { synthesizeJson } from "../lib/anthropic";
import type { WordEntry } from "../../../lib/types";

export async function fetchVocabSectionData(
  kind: "word-bank" | "compliment",
  usedWords: string[],
  todaysStories: { title: string; summary: string }[],
): Promise<{ entries: WordEntry[] }> {
  const isCompliment = kind === "compliment";
  return synthesizeJson<{ entries: WordEntry[] }>(
    isCompliment
      ? "You write 'Compliment Vocabulary': 2 English + 2 German words useful for a genuine, character-based compliment (not looks-based). Never reuse an already-used word."
      : "You write 'The Word Bank': 2 English + 2 German words tied to today's actual news stories. Never reuse an already-used word.",
    `Already used (never reuse any of these): ${usedWords.join(", ") || "none yet"}\n\n` +
      (isCompliment ? "" : `Today's stories:\n${todaysStories.map((s) => `- ${s.title}: ${s.summary}`).join("\n")}\n\n`) +
      `Return JSON: {"entries": [{"word": "...", "language": "English"|"German", "pronunciation": "...", "englishMeaning": "...", "hindiMeaning": "...", "englishSentence": "...", "germanSentence": "... (required for German words)"` +
      (isCompliment ? "" : `, "tiedToNews": "..."`) +
      `}]} with exactly 4 entries: 2 English, 2 German.`,
  );
}
