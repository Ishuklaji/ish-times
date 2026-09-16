// Core content model for The Ish Times.
// Every section on the frontend is rendered purely from this JSON shape —
// no section text is ever hardcoded into a component.

export type SectionLayout =
  | "narrative" // headline / what happened / affects me / talking point (+ optional stat box, useIt)
  | "markets" // index table + news items
  | "company-cards" // 5 company cards
  | "reflection" // Today's Reflection (Speaking Tree style)
  | "on-this-day" // historical events for the date
  | "jokes" // Wit Column dialogues
  | "vocab" // Word Bank / Compliment Vocabulary
  | "books" // Book of the Day
  | "shloka" // Sanskrit Shloka
  | "list-cards" // Good News / Daily Life Solved / Did You Know / Dating & Social / Youth Perspective
  | "advice" // Life, Style & Confidence / Understand People
  | "startup-watch" // Startup Watch x4
  | "jobs" // IT Job Market
  | "astrology"; // Astrology Corner

export type FreshnessStatus = "fresh" | "forecast" | "unchanged-evergreen" | "seed";

export interface SourceRef {
  label: string;
  url?: string;
  publishedAt?: string; // ISO date
}

export interface Discrepancy {
  claim: string;
  sources: SourceRef[];
}

/** Metadata every section carries about how its content was produced today. */
export interface SectionMeta {
  status: FreshnessStatus;
  /** Present only when status === "forecast" */
  forecastNote?: string;
  /** Present only when status === "forecast": a concrete signal to watch for */
  watchFor?: string;
  fetchedAt: string; // ISO timestamp of the run that produced this content
  sources: SourceRef[];
  discrepancies?: Discrepancy[];
}

export interface NarrativeBody {
  headline: string;
  whatHappened: string;
  affectsMe: string;
  talkingPoint: string;
  useIt?: string;
  statBox?: { label: string; value: string; asOf: string };
}

export interface MarketIndex {
  name: string; // e.g. "S&P 500"
  region: "US" | "Germany" | "EU" | "India";
  value: string;
  change: string; // e.g. "+0.42%"
  direction: "up" | "down" | "flat";
  asOf: string; // ISO date the quote is from
  marketClosed?: boolean;
  closedReason?: string;
}

export interface MarketsBody {
  indices: MarketIndex[];
  items: { headline: string; points: [string, string, string, string] }[];
}

export interface CompanyCard {
  company: string;
  region: "US" | "EU" | "Germany" | "India";
  good: string;
  bad: string;
  affectsMe: string;
  outlook: string; // must cite a named analyst/firm, never a buy/sell call
  outlookSource: string; // e.g. "Morgan Stanley analyst note"
}

export interface ReflectionBody {
  concept: string; // real Sanskrit/Vedantic/Buddhist term, never repeated
  explanation: string;
  connections: string[]; // 2-3 links to today's actual stories
}

export interface HistoricalEvent {
  year: string;
  era?: string;
  culture?: string;
  event: string;
}

export interface OnThisDayBody {
  date: string;
  events: HistoricalEvent[];
  gaps?: string[]; // eras/cultures with no confirmed event for this date
}

export interface JokeDialogue {
  characterA: string;
  characterB: string;
  setup: string;
  punchline: string;
  tiedToStory?: string;
}

export interface WordEntry {
  word: string;
  language: "English" | "German";
  pronunciation: string;
  englishMeaning: string;
  hindiMeaning: string;
  englishSentence: string;
  germanSentence?: string;
  tiedToNews?: string;
}

export interface BookEntry {
  title: string;
  author: string;
  language: "English" | "Hindi";
  keyIdeas: string[]; // 4+
}

export interface ShlokaBody {
  verse: string; // Devanagari or transliteration
  source: string; // e.g. "Bhagavad Gita 2.47"
  wordByWord: { word: string; meaning: string }[];
  hindiTranslation: string;
  englishTranslation: string;
}

export interface ListCardItem {
  title: string;
  detail: string;
  date?: string;
  link?: string;
  refersTo?: string; // for Did You Know: which other section this cites
}

export interface AdviceBody {
  intro: string;
  points: { title: string; detail: string }[];
}

export interface StartupWatchBody {
  region: "USA" | "Europe" | "China" | "India";
  trend: "booming" | "steady" | "falling" | "mixed";
  summary: string;
  dataPoints: { label: string; value: string; source: string }[];
  nuance?: string;
}

export interface JobPosting {
  title: string;
  company: string;
  location: string;
  stack: string[];
  url: string;
  verifiedAt: string; // ISO timestamp of last successful HTTP 200 check
  postedAt?: string;
}

export interface JobsBody {
  postings: JobPosting[];
  searchLinks: { label: string; url: string }[]; // permanent LinkedIn/Xing/StepStone filters
}

export interface VedicChart {
  ascendant: string;
  moon: string;
  mars: string;
  jupiterSaturn: string;
  rahu: string;
  currentDasha: string;
}

export interface AstrologyBody {
  vedic: {
    transitSummary: string; // 3-4 sentences
    suggestion: string;
  };
  tarot: {
    card: string;
    orientation: "upright" | "reversed";
    traditionalMeaning: string;
    dailyThemeConnection: string;
    reflectiveQuestion: string;
  };
  disclaimer: string;
}

export type SectionBody =
  | { layout: "narrative"; body: NarrativeBody }
  | { layout: "markets"; body: MarketsBody }
  | { layout: "company-cards"; body: { cards: CompanyCard[] } }
  | { layout: "reflection"; body: ReflectionBody }
  | { layout: "on-this-day"; body: OnThisDayBody }
  | { layout: "jokes"; body: { dialogues: JokeDialogue[] } }
  | { layout: "vocab"; body: { entries: WordEntry[] } }
  | { layout: "books"; body: { entries: BookEntry[] } }
  | { layout: "shloka"; body: ShlokaBody }
  | { layout: "list-cards"; body: { intro?: string; items: ListCardItem[] } }
  | { layout: "advice"; body: AdviceBody }
  | { layout: "startup-watch"; body: StartupWatchBody }
  | { layout: "jobs"; body: JobsBody }
  | { layout: "astrology"; body: AstrologyBody };

export interface Section {
  id: string; // stable slug, matches SectionDef.id in the registry
  number: number; // 1-28
  meta: SectionMeta;
  content: SectionBody;
}

export interface Edition {
  editionNumber: number;
  date: string; // ISO date, the edition's cover date
  preparedFor: string;
  pullQuote: string;
  generatedAt: string; // ISO timestamp of the run that produced this edition
  sections: Section[];
}

/** Per-run pipeline log for the admin/debug view. */
export interface RunLogEntry {
  sectionId: string;
  status: FreshnessStatus;
  reason?: string;
  durationMs?: number;
}

export interface RunLog {
  runAt: string;
  editionNumber: number;
  entries: RunLogEntry[];
  errors: { sectionId: string; message: string }[];
}
