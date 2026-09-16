import { synthesizeJson } from "../lib/llm";
import type { BookEntry } from "../../../lib/types";

export async function fetchBooksSectionData(usedBooks: string[]): Promise<{ entries: BookEntry[] }> {
  return synthesizeJson<{ entries: BookEntry[] }>(
    "You write 'Book of the Day': exactly 1 real English book + 1 real Hindi book, never repeated, each with 4+ genuine key ideas.",
    `Already used (never reuse any of these titles): ${usedBooks.join(", ") || "none yet"}\n\n` +
      `Return JSON: {"entries": [{"title": "...", "author": "...", "language": "English", "keyIdeas": ["...", "...", "...", "..."]}, {"title": "...", "author": "...", "language": "Hindi", "keyIdeas": ["...", "...", "...", "..."]}]}`,
  );
}
