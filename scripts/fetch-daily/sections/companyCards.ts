import { searchNarrowNews } from "../lib/news";
import { synthesizeJson } from "../lib/llm";
import { PROFILE_CONTEXT, COMPANY_NEWS_QUERIES } from "../config";
import type { CompanyCard, Section, SourceRef } from "../../../lib/types";

export interface CompanyCardsResult {
  content: { layout: "company-cards"; body: { cards: CompanyCard[] } };
  status: "fresh" | "forecast";
  sources: SourceRef[];
  reason: string;
}

export async function fetchCompanyCardsSectionData(previousSection: Section | undefined): Promise<CompanyCardsResult> {
  const previousCards =
    previousSection?.content.layout === "company-cards" ? previousSection.content.body.cards : [];
  const sources: SourceRef[] = [];
  const cards: CompanyCard[] = [];
  let anyFresh = false;

  for (const { company, region } of COMPANY_NEWS_QUERIES) {
    const found = await searchNarrowNews([`"${company}"`]);
    if (!found) {
      const prev = previousCards.find((c) => c.company === company);
      if (prev) cards.push(prev);
      continue;
    }
    anyFresh = true;
    const facts = found.articles
      .slice(0, 3)
      .map((a, i) => `[${i + 1}] ${a.title} — ${a.description}`)
      .join("\n");

    const synthesized = await synthesizeJson<Omit<CompanyCard, "company" | "region">>(
      `You write one company-news card about "${company}" for a personal daily newspaper. ${PROFILE_CONTEXT} ` +
        `Use ONLY the facts given. "outlook" must cite a NAMED analyst or firm from the facts if one is present, ` +
        `or say "No analyst view reported today" — never give your own buy/sell recommendation.`,
      `Facts:\n${facts}\n\n` +
        `Return JSON: {"good": "...", "bad": "...", "affectsMe": "...", "outlook": "...", "outlookSource": "..."}`,
    );

    cards.push({ company, region, ...synthesized });
    sources.push(...found.articles.map((a) => ({ label: a.sourceName, url: a.url, publishedAt: a.publishedAt })));
  }

  return {
    content: { layout: "company-cards", body: { cards } },
    status: anyFresh ? "fresh" : "forecast",
    sources,
    reason: anyFresh ? "At least one company had fresh coverage" : "No company query returned results today",
  };
}
