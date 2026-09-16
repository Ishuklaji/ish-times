import { fetchMarketIndices } from "../lib/markets";
import { searchNarrowNews } from "../lib/news";
import { synthesizeJson } from "../lib/anthropic";
import { isDuplicateOrStale } from "../lib/forecast";
import { PROFILE_CONTEXT, NEWS_QUERIES } from "../config";
import type { MarketsBody, Section, SourceRef } from "../../../lib/types";

export interface MarketsSectionResult {
  content: { layout: "markets"; body: MarketsBody };
  status: "fresh" | "forecast";
  forecastNote?: string;
  sources: SourceRef[];
  reason: string;
}

export async function fetchMarketsSectionData(previousSection: Section | undefined): Promise<MarketsSectionResult> {
  const indices = await fetchMarketIndices();
  const previousBody = previousSection?.content.layout === "markets" ? previousSection.content.body : undefined;
  const found = await searchNarrowNews(NEWS_QUERIES["business-markets"]);

  if (!found) {
    return {
      content: {
        layout: "markets",
        body: { indices, items: previousBody?.items ?? [] },
      },
      status: "forecast",
      forecastNote: "No new central-bank or markets headline found today; indices are still live.",
      sources: previousSection?.meta.sources ?? [],
      reason: "No news query returned results; carried forward previous market commentary",
    };
  }

  const isDuplicate = previousBody?.items[0]
    ? isDuplicateOrStale(previousBody.items[0].headline, found.articles[0].title)
    : false;

  if (isDuplicate && previousBody) {
    return {
      content: { layout: "markets", body: { indices, items: previousBody.items } },
      status: "forecast",
      forecastNote: "Same market story already on file; only live index values were refreshed.",
      sources: previousSection?.meta.sources ?? [],
      reason: `Query "${found.query}" duplicated existing market story`,
    };
  }

  const facts = found.articles
    .slice(0, 2)
    .map((a, i) => `[${i + 1}] ${a.title} — ${a.description} (${a.sourceName}, ${a.publishedAt})`)
    .join("\n");

  const synthesized = await synthesizeJson<{ items: MarketsBody["items"] }>(
    `You write the "Business & Markets" section of a personal daily newspaper for Ish. ${PROFILE_CONTEXT} ` +
      `Use ONLY the facts given — never invent figures. For each item, write exactly 4 short factual bullet points.`,
    `Facts (query: "${found.query}"):\n${facts}\n\n` +
      `Return JSON: {"items": [{"headline": "...", "points": ["...", "...", "...", "..."]}]}`,
  );

  return {
    content: { layout: "markets", body: { indices, items: synthesized.items } },
    status: "fresh",
    sources: found.articles.map((a) => ({ label: a.sourceName, url: a.url, publishedAt: a.publishedAt })),
    reason: `Fresh result from query "${found.query}"`,
  };
}
