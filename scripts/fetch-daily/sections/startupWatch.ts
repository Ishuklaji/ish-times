import { searchNarrowNews } from "../lib/news";
import { synthesizeJson } from "../lib/llm";
import { isDuplicateOrStale } from "../lib/forecast";
import type { Section, SourceRef, StartupWatchBody } from "../../../lib/types";

const REGION_QUERIES: Record<StartupWatchBody["region"], string[]> = {
  USA: ['"Series A" OR "Series B" funding startup United States', '"venture capital" funding round United States'],
  Europe: ['"Series A" OR "Series B" funding startup Europe', '"venture capital" funding round European startup'],
  China: ['"funding round" startup China', '"venture capital" China startup'],
  India: ['"funding round" startup India', '"venture capital" India startup'],
};

export interface StartupWatchResult {
  content: { layout: "startup-watch"; body: StartupWatchBody };
  status: "fresh" | "forecast";
  sources: SourceRef[];
  reason: string;
}

export async function fetchStartupWatchSectionData(
  region: StartupWatchBody["region"],
  previousSection: Section | undefined,
): Promise<StartupWatchResult> {
  const found = await searchNarrowNews(REGION_QUERIES[region]);
  const previousBody =
    previousSection?.content.layout === "startup-watch" ? previousSection.content.body : undefined;

  if (!found) {
    if (!previousBody) throw new Error(`No funding news found for ${region} and no previous entry`);
    return {
      content: { layout: "startup-watch", body: previousBody },
      status: "forecast",
      sources: previousSection?.meta.sources ?? [],
      reason: `No funding-news query returned results for ${region}`,
    };
  }

  const isDuplicate = previousBody ? isDuplicateOrStale(previousBody.summary, found.articles[0].title) : false;
  if (isDuplicate && previousBody) {
    return {
      content: { layout: "startup-watch", body: previousBody },
      status: "forecast",
      sources: previousSection?.meta.sources ?? [],
      reason: `Query duplicated existing ${region} startup story`,
    };
  }

  const facts = found.articles
    .slice(0, 4)
    .map((a) => `- ${a.title} — ${a.description} (${a.sourceName}, ${a.publishedAt})`)
    .join("\n");

  const synthesized = await synthesizeJson<Omit<StartupWatchBody, "region">>(
    `You write 'Startup Watch: ${region}'. Use ONLY the facts given — never invent a funding figure. Judge the trend honestly (booming/steady/falling/mixed); if the data is genuinely mixed, say "mixed" and explain the nuance rather than forcing a clean narrative.`,
    `Facts:\n${facts}\n\n` +
      `Return JSON: {"trend": "booming"|"steady"|"falling"|"mixed", "summary": "...", "dataPoints": [{"label": "...", "value": "...", "source": "..."}], "nuance": "... (optional)"}`,
  );

  return {
    content: { layout: "startup-watch", body: { region, ...synthesized } },
    status: "fresh",
    sources: found.articles.map((a) => ({ label: a.sourceName, url: a.url, publishedAt: a.publishedAt })),
    reason: `Fresh result from query "${found.query}"`,
  };
}
