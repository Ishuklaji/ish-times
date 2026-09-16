// One-time / resettable generator for the placeholder "seed" edition that
// ships before the daily fetch job has ever run. Every field is an honest
// placeholder — nothing here is presented as a real fact, quote, or figure.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SECTION_REGISTRY } from "../lib/sections-registry";
import { NATAL_CHART } from "../lib/natal-chart";
import type {
  Edition,
  Section,
  SectionBody,
  SectionMeta,
  RunLog,
} from "../lib/types";

const now = new Date().toISOString();
const today = now.slice(0, 10);
const PLACEHOLDER = "Awaiting the first automated daily fetch.";

const seedMeta: SectionMeta = {
  status: "seed",
  fetchedAt: now,
  sources: [],
};

function bodyFor(layout: SectionBody["layout"]): SectionBody {
  switch (layout) {
    case "narrative":
      return {
        layout,
        body: {
          headline: PLACEHOLDER,
          whatHappened: PLACEHOLDER,
          affectsMe: PLACEHOLDER,
          talkingPoint: PLACEHOLDER,
        },
      };
    case "markets":
      return {
        layout,
        body: {
          indices: (["US", "Germany", "EU", "India"] as const).map((region) => ({
            name: `${region} index`,
            region,
            value: "—",
            change: "—",
            direction: "flat" as const,
            asOf: today,
            marketClosed: true,
            closedReason: "No data fetched yet",
          })),
          items: [{ headline: PLACEHOLDER, points: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER] }],
        },
      };
    case "company-cards":
      return {
        layout,
        body: {
          cards: (["US", "EU", "Germany", "India", "US"] as const).map((region) => ({
            company: "—",
            region,
            good: PLACEHOLDER,
            bad: PLACEHOLDER,
            affectsMe: PLACEHOLDER,
            outlook: PLACEHOLDER,
            outlookSource: "—",
          })),
        },
      };
    case "reflection":
      return {
        layout,
        body: { concept: "—", explanation: PLACEHOLDER, connections: [] },
      };
    case "on-this-day":
      return {
        layout,
        body: { date: today, events: [], gaps: [PLACEHOLDER] },
      };
    case "jokes":
      return {
        layout,
        body: {
          dialogues: Array.from({ length: 4 }, () => ({
            characterA: "A",
            characterB: "B",
            setup: PLACEHOLDER,
            punchline: PLACEHOLDER,
          })),
        },
      };
    case "vocab":
      return {
        layout,
        body: {
          entries: Array.from({ length: 4 }, (_, i) => ({
            word: "—",
            language: (i % 2 === 0 ? "English" : "German") as "English" | "German",
            pronunciation: "—",
            englishMeaning: PLACEHOLDER,
            hindiMeaning: "—",
            englishSentence: PLACEHOLDER,
          })),
        },
      };
    case "books":
      return {
        layout,
        body: {
          entries: (["English", "Hindi"] as const).map((language) => ({
            title: "—",
            author: "—",
            language,
            keyIdeas: [PLACEHOLDER],
          })),
        },
      };
    case "shloka":
      return {
        layout,
        body: {
          verse: "—",
          source: "—",
          wordByWord: [],
          hindiTranslation: PLACEHOLDER,
          englishTranslation: PLACEHOLDER,
        },
      };
    case "list-cards":
      return { layout, body: { items: [{ title: PLACEHOLDER, detail: PLACEHOLDER }] } };
    case "advice":
      return { layout, body: { intro: PLACEHOLDER, points: [{ title: "—", detail: PLACEHOLDER }] } };
    case "startup-watch":
      return {
        layout,
        body: {
          region: "USA",
          trend: "mixed",
          summary: PLACEHOLDER,
          dataPoints: [],
        },
      };
    case "jobs":
      return {
        layout,
        body: {
          postings: [],
          searchLinks: [
            { label: "LinkedIn — React/Next.js/TypeScript, Berlin", url: "https://www.linkedin.com/jobs/search/?keywords=React%20Next.js%20TypeScript&location=Berlin" },
            { label: "Xing — React/Next.js/TypeScript, Berlin", url: "https://www.xing.com/jobs/search?keywords=React%20Next.js%20TypeScript&location=Berlin" },
            { label: "StepStone — React/Next.js/TypeScript, Berlin", url: "https://www.stepstone.de/jobs/react-next-js-typescript/in-berlin" },
          ],
        },
      };
    case "astrology":
      return {
        layout,
        body: {
          vedic: { transitSummary: PLACEHOLDER, suggestion: PLACEHOLDER },
          tarot: {
            card: "—",
            orientation: "upright",
            traditionalMeaning: PLACEHOLDER,
            dailyThemeConnection: PLACEHOLDER,
            reflectiveQuestion: PLACEHOLDER,
          },
          disclaimer:
            "Offered as a traditional interpretive practice for reflection, not a guaranteed forecast.",
        },
      };
  }
}

const sections: Section[] = SECTION_REGISTRY.map((def) => ({
  id: def.id,
  number: def.number,
  meta: seedMeta,
  content: bodyFor(def.layout),
}));

const edition: Edition = {
  editionNumber: 0,
  date: today,
  preparedFor: "Ish B. Shukla",
  pullQuote: "The first edition arrives after tomorrow morning's automated run.",
  generatedAt: now,
  sections,
};

const runLog: RunLog = {
  runAt: now,
  editionNumber: 0,
  entries: SECTION_REGISTRY.map((def) => ({ sectionId: def.id, status: "seed" as const })),
  errors: [],
};

const dataDir = join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });
writeFileSync(join(dataDir, "current.json"), JSON.stringify(edition, null, 2));
writeFileSync(join(dataDir, "run-log.json"), JSON.stringify(runLog, null, 2));
writeFileSync(join(dataDir, "used-items.json"), JSON.stringify({ words: [], books: [], shlokas: [], concepts: [], psychologyPrinciples: [] }, null, 2));

console.log("Wrote seed data/current.json, data/run-log.json, data/used-items.json");
console.log(`Reminder: this references the natal chart constant (${NATAL_CHART.ascendant}) — not used in seed copy, only by the real daily fetch.`);
