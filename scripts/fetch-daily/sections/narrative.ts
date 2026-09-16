import { searchNarrowNews } from "../lib/news";
import { synthesizeJson } from "../lib/anthropic";
import { isDuplicateOrStale, buildForecastNarrative } from "../lib/forecast";
import { PROFILE_CONTEXT } from "../config";
import type { Discrepancy, NarrativeBody, Section, SourceRef } from "../../../lib/types";

export interface NarrativeSectionResult {
  content: { layout: "narrative"; body: NarrativeBody };
  status: "fresh" | "forecast";
  forecastNote?: string;
  watchFor?: string;
  sources: SourceRef[];
  discrepancies?: Discrepancy[];
  reason: string;
}

export async function fetchNarrativeSection(
  sectionTitle: string,
  queries: string[],
  previousSection: Section | undefined,
  wantsStatBox: boolean,
): Promise<NarrativeSectionResult> {
  const found = await searchNarrowNews(queries);
  const previousBody =
    previousSection?.content.layout === "narrative" ? previousSection.content.body : undefined;

  if (!found) {
    if (!previousBody) {
      throw new Error("No news found and no previous entry to build a forecast from");
    }
    const forecast = await buildForecastNarrative(sectionTitle, previousBody);
    return {
      content: { layout: "narrative", body: forecast.body },
      status: "forecast",
      forecastNote: forecast.forecastNote,
      watchFor: forecast.watchFor,
      sources: previousSection?.meta.sources ?? [],
      reason: "All narrow queries returned zero results",
    };
  }

  const isDuplicate = previousBody ? isDuplicateOrStale(previousBody.headline, found.articles[0].title) : false;

  if (isDuplicate && previousBody) {
    const forecast = await buildForecastNarrative(sectionTitle, previousBody);
    return {
      content: { layout: "narrative", body: forecast.body },
      status: "forecast",
      forecastNote: forecast.forecastNote,
      watchFor: forecast.watchFor,
      sources: previousSection?.meta.sources ?? [],
      reason: `Query "${found.query}" returned only the same/older story already on file`,
    };
  }

  const facts = found.articles
    .map((a, i) => `[${i + 1}] ${a.title} — ${a.description} (${a.sourceName}, ${a.publishedAt})`)
    .join("\n");

  const synthesized = await synthesizeJson<NarrativeBody & { discrepancies?: Discrepancy[] }>(
    `You write the "${sectionTitle}" section of a personal daily newspaper for Ish. ${PROFILE_CONTEXT} ` +
      `Use ONLY the facts given below — never invent a quote, figure, or event not present in them. ` +
      `Write a specific headline, a factual "what happened" (naming the real officials/entities involved), ` +
      `a genuinely personal "affects me" tying it to Ish's life as described, and one talking-point line he could use in conversation. ` +
      `If two of the given sources report conflicting figures or claims about the same fact, do NOT silently pick one — list it under "discrepancies".` +
      (wantsStatBox ? " Also include a statBox with one real number drawn from the facts (label, value, asOf date)." : ""),
    `Facts from today's search (query: "${found.query}"):\n${facts}\n\n` +
      `Return JSON: {"headline": "...", "whatHappened": "...", "affectsMe": "...", "talkingPoint": "..."` +
      (wantsStatBox ? `, "statBox": {"label": "...", "value": "...", "asOf": "..."}` : "") +
      `, "discrepancies": [{"claim": "...", "sources": [{"label": "..."}]}]}`,
  );

  const { discrepancies, ...body } = synthesized;

  return {
    content: { layout: "narrative", body },
    status: "fresh",
    sources: found.articles.map((a) => ({ label: a.sourceName, url: a.url, publishedAt: a.publishedAt })),
    discrepancies: discrepancies && discrepancies.length > 0 ? discrepancies : undefined,
    reason: `Fresh result from query "${found.query}"`,
  };
}
