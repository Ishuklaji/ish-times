import { synthesizeJson } from "./llm";
import type { NarrativeBody } from "../../../lib/types";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function wordSet(text: string): Set<string> {
  return new Set(normalize(text).split(/\s+/).filter((w) => w.length > 3));
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = wordSet(a);
  const setB = wordSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

/** True when the "new" story is really the same or an older story as what we already have. */
export function isDuplicateOrStale(previousHeadline: string, candidateHeadline: string): boolean {
  return jaccardSimilarity(previousHeadline, candidateHeadline) > 0.55;
}

export async function buildForecastNarrative(
  sectionTitle: string,
  previousBody: NarrativeBody,
): Promise<{ body: NarrativeBody; forecastNote: string; watchFor: string }> {
  const result = await synthesizeJson<{
    headline: string;
    whatHappened: string;
    affectsMe: string;
    talkingPoint: string;
    forecastNote: string;
    watchFor: string;
  }>(
    `You write a clearly-labeled FORECAST entry for the "${sectionTitle}" section of a personal daily newspaper. ` +
      `The daily fetch found no genuinely new development today — only the same story already on file. ` +
      `Write forward-looking, speculative commentary based on the existing stored facts below. ` +
      `Rules: never state a repeated specific figure, quote, or fact from the existing entry as if it were new. ` +
      `Never present the forecast as something that has already happened. ` +
      `Include a concrete, checkable "watch for" signal (a specific date, vote, ruling, or event to look out for).`,
    `Existing stored entry for "${sectionTitle}":\n` +
      `Headline: ${previousBody.headline}\n` +
      `What happened: ${previousBody.whatHappened}\n\n` +
      `Return JSON: {"headline": "...", "whatHappened": "...", "affectsMe": "...", "talkingPoint": "...", "forecastNote": "one sentence explaining this is a forecast because no new development was found", "watchFor": "concrete signal to watch for"}`,
  );

  return {
    body: {
      headline: result.headline,
      whatHappened: result.whatHappened,
      affectsMe: result.affectsMe,
      talkingPoint: result.talkingPoint,
    },
    forecastNote: result.forecastNote,
    watchFor: result.watchFor,
  };
}
