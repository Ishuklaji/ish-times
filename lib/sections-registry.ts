import type { SectionLayout } from "./types";

export interface SectionDef {
  id: string;
  number: number;
  title: string;
  layout: SectionLayout;
  /** Tailwind-safe accent color used for the card's border/header/dots */
  accent: string;
  /** Google Font family name, always paired with a system-font fallback stack in CSS */
  font: string;
}

export const SECTION_REGISTRY: SectionDef[] = [
  { id: "global-politics", number: 1, title: "Global Politics", layout: "narrative", accent: "#8B1E3F", font: "Playfair Display" },
  { id: "indian-politics", number: 2, title: "Indian Politics", layout: "narrative", accent: "#B45309", font: "Playfair Display" },
  { id: "germany-eu-politics", number: 3, title: "Germany & EU Politics", layout: "narrative", accent: "#1E3A8A", font: "Playfair Display" },
  { id: "war-conflict", number: 4, title: "War & Conflict", layout: "narrative", accent: "#7F1D1D", font: "Playfair Display" },
  { id: "business-markets", number: 5, title: "Business & Markets", layout: "markets", accent: "#065F46", font: "Source Serif 4" },
  { id: "top-company-news", number: 6, title: "Top 5 Company News", layout: "company-cards", accent: "#0F766E", font: "Source Serif 4" },
  { id: "tech", number: 7, title: "Tech", layout: "narrative", accent: "#4338CA", font: "Space Grotesk" },
  { id: "trade", number: 8, title: "Trade", layout: "narrative", accent: "#92400E", font: "Source Serif 4" },
  { id: "todays-reflection", number: 9, title: "Today's Reflection", layout: "reflection", accent: "#78350F", font: "Cormorant Garamond" },
  { id: "on-this-day", number: 10, title: "On This Day", layout: "on-this-day", accent: "#3F3F46", font: "Playfair Display" },
  { id: "wit-column", number: 11, title: "The Wit Column", layout: "jokes", accent: "#BE185D", font: "Arial" },
  { id: "word-bank", number: 12, title: "The Word Bank", layout: "vocab", accent: "#1D4ED8", font: "Source Serif 4" },
  { id: "compliment-vocabulary", number: 13, title: "Compliment Vocabulary", layout: "vocab", accent: "#C2410C", font: "Source Serif 4" },
  { id: "book-of-the-day", number: 14, title: "Book of the Day", layout: "books", accent: "#374151", font: "Cormorant Garamond" },
  { id: "sanskrit-shloka", number: 15, title: "Sanskrit Shloka", layout: "shloka", accent: "#92400E", font: "Cormorant Garamond" },
  { id: "good-news", number: 16, title: "Good News", layout: "list-cards", accent: "#15803D", font: "Source Serif 4" },
  { id: "daily-life-solved", number: 17, title: "Daily Life, Solved", layout: "list-cards", accent: "#0369A1", font: "Space Grotesk" },
  { id: "life-style-confidence", number: 18, title: "Life, Style & Confidence", layout: "advice", accent: "#9D174D", font: "Cormorant Garamond" },
  { id: "did-you-know", number: 19, title: "Did You Know?", layout: "list-cards", accent: "#5B21B6", font: "Space Grotesk" },
  { id: "dating-social-life", number: 20, title: "Dating & Social Life", layout: "list-cards", accent: "#BE123C", font: "Cormorant Garamond" },
  { id: "youth-perspective", number: 21, title: "European & German Youth Perspective", layout: "list-cards", accent: "#1E40AF", font: "Space Grotesk" },
  { id: "understand-people", number: 22, title: "Understand People — Daily", layout: "advice", accent: "#134E4A", font: "Source Serif 4" },
  { id: "startup-watch-usa", number: 23, title: "Startup Watch: USA", layout: "startup-watch", accent: "#1D4ED8", font: "Space Grotesk" },
  { id: "startup-watch-europe", number: 24, title: "Startup Watch: Europe", layout: "startup-watch", accent: "#4338CA", font: "Space Grotesk" },
  { id: "startup-watch-china", number: 25, title: "Startup Watch: China", layout: "startup-watch", accent: "#B91C1C", font: "Space Grotesk" },
  { id: "startup-watch-india", number: 26, title: "Startup Watch: India", layout: "startup-watch", accent: "#C2410C", font: "Space Grotesk" },
  { id: "it-job-market", number: 27, title: "IT Job Market", layout: "jobs", accent: "#0F766E", font: "Space Grotesk" },
  { id: "astrology-corner", number: 28, title: "Astrology Corner", layout: "astrology", accent: "#6D28D9", font: "Cormorant Garamond" },
];

export const TOTAL_SECTIONS = SECTION_REGISTRY.length;

export function getSectionDef(id: string): SectionDef | undefined {
  return SECTION_REGISTRY.find((s) => s.id === id);
}
