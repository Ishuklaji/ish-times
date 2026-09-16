import { searchNarrowNews } from "../lib/news";
import { synthesizeJson } from "../lib/anthropic";
import type { ListCardItem } from "../../../lib/types";

export type ListCardsKind =
  | "good-news"
  | "daily-life-solved"
  | "did-you-know"
  | "dating-social-life"
  | "youth-perspective";

const NEWS_BACKED: ListCardsKind[] = ["good-news"];

const PROMPTS: Record<ListCardsKind, { system: string; instruction: string; count: number }> = {
  "good-news": {
    system: "You write 'Good News': 3 real, dated positive stories from the last week. Use ONLY the facts given — never invent a story.",
    instruction: "For each, give title, a 1-2 sentence detail, and the real date.",
    count: 3,
  },
  "daily-life-solved": {
    system: "You write 'Daily Life, Solved': genuine, practical problem/fix cards for everyday annoyances (tech, chores, admin, health).",
    instruction: "Give 4 real problem/fix cards a person could actually use today.",
    count: 4,
  },
  "did-you-know": {
    system: "You write 'Did You Know?': trivia facts that each genuinely tie back to another section already in today's edition. Every fact must cite which section/item it refers to via 'refersTo'.",
    instruction: "Give 4 trivia facts, each referencing a specific other item from today's edition below.",
    count: 4,
  },
  "dating-social-life": {
    system: "You know real, currently-active social/dating event series and communities in Berlin (e.g. established meetup groups, recurring language exchanges, social sport leagues). Only name ones you're genuinely confident are real and ongoing; if unsure of a specific link, describe the group/series by name without fabricating a URL.",
    instruction: "Give 3-4 real Berlin event/group entries a newcomer could actually attend.",
    count: 4,
  },
  "youth-perspective": {
    system: "You write 'European & German Youth Perspective': real survey/research findings about young Europeans/Germans (e.g. Shell Jugendstudie, Eurobarometer, similar). Cite the real source study by name — never invent a statistic.",
    instruction: "Give 3-4 real findings, each citing its source study by name in the detail text.",
    count: 4,
  },
};

export async function fetchListCardsSectionData(
  kind: ListCardsKind,
  context: string,
): Promise<{ intro?: string; items: ListCardItem[] }> {
  const cfg = PROMPTS[kind];
  let facts = "";

  if (NEWS_BACKED.includes(kind)) {
    const found = await searchNarrowNews(['"good news" positive story this week']);
    if (found) {
      facts = found.articles
        .map((a) => `- ${a.title} — ${a.description} (${a.sourceName}, ${a.publishedAt})`)
        .join("\n");
    }
  }

  return synthesizeJson<{ intro?: string; items: ListCardItem[] }>(
    cfg.system,
    `${cfg.instruction}\n\n${context}${facts ? `\n\nSourced facts:\n${facts}` : ""}\n\n` +
      `Return JSON: {"items": [{"title": "...", "detail": "...", "date": "... (if applicable)", "link": "... (if applicable)", "refersTo": "... (if applicable)"}]} with ${cfg.count} items.`,
  );
}
