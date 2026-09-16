import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SECTION_REGISTRY } from "../../lib/sections-registry";
import { NEWS_QUERIES } from "./config";
import { loadUsedItems, saveUsedItems, markUsed } from "./lib/used-items";
import { synthesizeJson } from "./lib/llm";
import { fetchNarrativeSection } from "./sections/narrative";
import { fetchMarketsSectionData } from "./sections/markets";
import { fetchCompanyCardsSectionData } from "./sections/companyCards";
import { fetchReflectionSectionData } from "./sections/reflection";
import { fetchOnThisDaySectionData } from "./sections/onThisDay";
import { fetchJokesSectionData } from "./sections/jokes";
import { fetchVocabSectionData } from "./sections/vocab";
import { fetchBooksSectionData } from "./sections/books";
import { fetchShlokaSectionData } from "./sections/shloka";
import { fetchListCardsSectionData, type ListCardsKind } from "./sections/listCards";
import { fetchAdviceSectionData, type AdviceKind } from "./sections/advice";
import { fetchStartupWatchSectionData } from "./sections/startupWatch";
import { fetchJobsSectionData } from "./sections/jobsSection";
import { buildAstrologySection } from "./lib/astrology";
import type { Edition, RunLog, RunLogEntry, Section, SectionMeta } from "../../lib/types";

const DATA_DIR = join(__dirname, "..", "..", "data");
const now = new Date();
const nowIso = now.toISOString();
const today = nowIso.slice(0, 10);

const runLogEntries: RunLogEntry[] = [];
const runLogErrors: { sectionId: string; message: string }[] = [];
const sections: Section[] = [];
const todaysStories: { title: string; summary: string }[] = [];

function loadPreviousEdition(): Edition | undefined {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, "current.json"), "utf-8"));
  } catch {
    return undefined;
  }
}

function findPrevious(previous: Edition | undefined, id: string): Section | undefined {
  return previous?.sections.find((s) => s.id === id);
}

function metaFrom(opts: {
  status: SectionMeta["status"];
  sources: SectionMeta["sources"];
  forecastNote?: string;
  watchFor?: string;
  discrepancies?: SectionMeta["discrepancies"];
}): SectionMeta {
  return { fetchedAt: nowIso, ...opts };
}

/**
 * Run one section's builder. On any exception, carry the previous edition's
 * section forward unchanged rather than crashing the whole run or silently
 * pretending success — the error is always surfaced in the run log.
 */
async function runSection(
  id: string,
  number: number,
  previous: Edition | undefined,
  build: (prevSection: Section | undefined) => Promise<Section>,
): Promise<void> {
  const start = Date.now();
  const prevSection = findPrevious(previous, id);
  try {
    const section = await build(prevSection);
    sections.push(section);
    runLogEntries.push({ sectionId: id, status: section.meta.status, durationMs: Date.now() - start });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    runLogErrors.push({ sectionId: id, message });
    if (prevSection) {
      sections.push(prevSection);
      runLogEntries.push({
        sectionId: id,
        status: prevSection.meta.status,
        reason: `Carried over previous content after error: ${message}`,
        durationMs: Date.now() - start,
      });
    } else {
      runLogEntries.push({ sectionId: id, status: "seed", reason: `Error and no previous content: ${message}`, durationMs: Date.now() - start });
    }
  }
}

function defOf(id: string) {
  const def = SECTION_REGISTRY.find((s) => s.id === id);
  if (!def) throw new Error(`Unknown section id ${id}`);
  return def;
}

async function main() {
  const previous = loadPreviousEdition();
  const usedItems = loadUsedItems();

  // --- Phase 1: news-driven narrative / markets / company / startup sections ---
  const narrativeDefs: { id: string; wantsStatBox: boolean }[] = [
    { id: "global-politics", wantsStatBox: false },
    { id: "indian-politics", wantsStatBox: false },
    { id: "germany-eu-politics", wantsStatBox: true },
    { id: "war-conflict", wantsStatBox: false },
    { id: "tech", wantsStatBox: false },
    { id: "trade", wantsStatBox: true },
  ];

  for (const { id, wantsStatBox } of narrativeDefs) {
    const def = defOf(id);
    await runSection(id, def.number, previous, async (prevSection) => {
      const result = await fetchNarrativeSection(def.title, NEWS_QUERIES[id], prevSection, wantsStatBox);
      if (result.status === "fresh") {
        todaysStories.push({ title: result.content.body.headline, summary: result.content.body.whatHappened });
      }
      return {
        id,
        number: def.number,
        meta: metaFrom({
          status: result.status,
          sources: result.sources,
          forecastNote: result.forecastNote,
          watchFor: result.watchFor,
          discrepancies: result.discrepancies,
        }),
        content: result.content,
      };
    });
  }

  await runSection("business-markets", defOf("business-markets").number, previous, async (prevSection) => {
    const result = await fetchMarketsSectionData(prevSection);
    return {
      id: "business-markets",
      number: defOf("business-markets").number,
      meta: metaFrom({ status: result.status, sources: result.sources, forecastNote: result.forecastNote }),
      content: result.content,
    };
  });

  await runSection("top-company-news", defOf("top-company-news").number, previous, async (prevSection) => {
    const result = await fetchCompanyCardsSectionData(prevSection);
    return {
      id: "top-company-news",
      number: defOf("top-company-news").number,
      meta: metaFrom({ status: result.status, sources: result.sources }),
      content: result.content,
    };
  });

  const startupIds: { id: string; region: "USA" | "Europe" | "China" | "India" }[] = [
    { id: "startup-watch-usa", region: "USA" },
    { id: "startup-watch-europe", region: "Europe" },
    { id: "startup-watch-china", region: "China" },
    { id: "startup-watch-india", region: "India" },
  ];
  for (const { id, region } of startupIds) {
    await runSection(id, defOf(id).number, previous, async (prevSection) => {
      const result = await fetchStartupWatchSectionData(region, prevSection);
      return {
        id,
        number: defOf(id).number,
        meta: metaFrom({ status: result.status, sources: result.sources }),
        content: result.content,
      };
    });
  }

  // --- Phase 2: sections that reference today's actual stories ---
  await runSection("todays-reflection", defOf("todays-reflection").number, previous, async () => {
    const body = await fetchReflectionSectionData(usedItems.concepts, todaysStories);
    markUsed(usedItems, "concepts", body.concept);
    return {
      id: "todays-reflection",
      number: defOf("todays-reflection").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "reflection", body },
    };
  });

  await runSection("wit-column", defOf("wit-column").number, previous, async () => {
    const body = await fetchJokesSectionData(todaysStories);
    return {
      id: "wit-column",
      number: defOf("wit-column").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "jokes", body },
    };
  });

  await runSection("word-bank", defOf("word-bank").number, previous, async () => {
    const body = await fetchVocabSectionData("word-bank", usedItems.words, todaysStories);
    for (const e of body.entries) markUsed(usedItems, "words", e.word);
    return {
      id: "word-bank",
      number: defOf("word-bank").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "vocab", body },
    };
  });

  // --- Phase 3: independent evergreen / creative sections ---
  await runSection("compliment-vocabulary", defOf("compliment-vocabulary").number, previous, async () => {
    const body = await fetchVocabSectionData("compliment", usedItems.words, []);
    for (const e of body.entries) markUsed(usedItems, "words", e.word);
    return {
      id: "compliment-vocabulary",
      number: defOf("compliment-vocabulary").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "vocab", body },
    };
  });

  await runSection("book-of-the-day", defOf("book-of-the-day").number, previous, async () => {
    const body = await fetchBooksSectionData(usedItems.books);
    for (const e of body.entries) markUsed(usedItems, "books", e.title);
    return {
      id: "book-of-the-day",
      number: defOf("book-of-the-day").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "books", body },
    };
  });

  await runSection("sanskrit-shloka", defOf("sanskrit-shloka").number, previous, async () => {
    const body = await fetchShlokaSectionData(usedItems.shlokas);
    markUsed(usedItems, "shlokas", body.source);
    return {
      id: "sanskrit-shloka",
      number: defOf("sanskrit-shloka").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "shloka", body },
    };
  });

  await runSection("on-this-day", defOf("on-this-day").number, previous, async () => {
    const body = await fetchOnThisDaySectionData(now);
    return {
      id: "on-this-day",
      number: defOf("on-this-day").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "on-this-day", body },
    };
  });

  const listCardsIds: { id: string; kind: ListCardsKind; context: string }[] = [
    { id: "good-news", kind: "good-news", context: "" },
    { id: "daily-life-solved", kind: "daily-life-solved", context: "" },
    { id: "dating-social-life", kind: "dating-social-life", context: "" },
    { id: "youth-perspective", kind: "youth-perspective", context: "" },
  ];
  for (const { id, kind, context } of listCardsIds) {
    await runSection(id, defOf(id).number, previous, async () => {
      const body = await fetchListCardsSectionData(kind, context);
      return {
        id,
        number: defOf(id).number,
        meta: metaFrom({ status: "fresh", sources: [] }),
        content: { layout: "list-cards", body },
      };
    });
  }

  const adviceIds: { id: string; kind: AdviceKind }[] = [
    { id: "life-style-confidence", kind: "life-style-confidence" },
    { id: "understand-people", kind: "understand-people" },
  ];
  for (const { id, kind } of adviceIds) {
    await runSection(id, defOf(id).number, previous, async () => {
      const body = await fetchAdviceSectionData(kind, usedItems.psychologyPrinciples);
      if (kind === "understand-people") {
        for (const p of body.points) markUsed(usedItems, "psychologyPrinciples", p.title);
      }
      return {
        id,
        number: defOf(id).number,
        meta: metaFrom({ status: "fresh", sources: [] }),
        content: { layout: "advice", body },
      };
    });
  }

  await runSection("it-job-market", defOf("it-job-market").number, previous, async () => {
    const body = await fetchJobsSectionData();
    return {
      id: "it-job-market",
      number: defOf("it-job-market").number,
      meta: metaFrom({ status: body.postings.length > 0 ? "fresh" : "forecast", sources: [] }),
      content: { layout: "jobs", body },
    };
  });

  await runSection("astrology-corner", defOf("astrology-corner").number, previous, async () => {
    const body = await buildAstrologySection(now);
    return {
      id: "astrology-corner",
      number: defOf("astrology-corner").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "astrology", body },
    };
  });

  // --- Phase 4: cross-referencing section, run last ---
  await runSection("did-you-know", defOf("did-you-know").number, previous, async () => {
    const otherSections = sections
      .map((s) => `${s.id}: ${JSON.stringify(s.content.body).slice(0, 200)}`)
      .join("\n");
    const body = await fetchListCardsSectionData(
      "did-you-know",
      `Today's other sections (id: excerpt):\n${otherSections}`,
    );
    return {
      id: "did-you-know",
      number: defOf("did-you-know").number,
      meta: metaFrom({ status: "fresh", sources: [] }),
      content: { layout: "list-cards", body },
    };
  });

  // Sort sections back into registry order for a stable edition array.
  sections.sort((a, b) => a.number - b.number);
  runLogEntries.sort((a, b) => defOf(a.sectionId).number - defOf(b.sectionId).number);

  let pullQuote = "Another day, another edition — read on.";
  try {
    const quote = await synthesizeJson<{ pullQuote: string }>(
      "You write a one-sentence editorial pull-quote for the masthead of a personal daily newspaper, capturing the day's tone.",
      `Today's fresh stories:\n${todaysStories.map((s) => `- ${s.title}`).join("\n")}\n\nReturn JSON: {"pullQuote": "..."}`,
    );
    pullQuote = quote.pullQuote;
  } catch {
    // Keep the static fallback if synthesis is unavailable.
  }

  const edition: Edition = {
    editionNumber: (previous?.editionNumber ?? 0) + 1,
    date: today,
    preparedFor: "Ish B. Shukla",
    pullQuote,
    generatedAt: nowIso,
    sections,
  };

  const runLog: RunLog = {
    runAt: nowIso,
    editionNumber: edition.editionNumber,
    entries: runLogEntries,
    errors: runLogErrors,
  };

  writeFileSync(join(DATA_DIR, "current.json"), JSON.stringify(edition, null, 2));
  writeFileSync(join(DATA_DIR, "run-log.json"), JSON.stringify(runLog, null, 2));
  saveUsedItems(usedItems);

  console.log(
    `Edition ${edition.editionNumber}: ${runLogEntries.filter((e) => e.status === "fresh").length} fresh, ` +
      `${runLogEntries.filter((e) => e.status === "forecast").length} forecast, ${runLogErrors.length} errors.`,
  );
}

main().catch((err) => {
  console.error("Daily fetch failed:", err);
  process.exit(1);
});
