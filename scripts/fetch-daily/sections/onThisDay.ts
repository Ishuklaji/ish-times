import { synthesizeJson } from "../lib/llm";
import type { OnThisDayBody } from "../../../lib/types";

export async function fetchOnThisDaySectionData(date: Date): Promise<OnThisDayBody> {
  const monthDay = date.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return synthesizeJson<OnThisDayBody>(
    "You write 'On This Day' for a personal newspaper. You only state historical events you are genuinely confident are real and well-documented for the exact calendar date given, spanning different eras and cultures. If you are not confident an event happened on this exact date, do not include it — say plainly in 'gaps' that no confirmed event was found for a given era/culture instead of guessing.",
    `Today's date: ${monthDay}.\n\n` +
      `Give 4-6 real historical events that occurred on ${monthDay} in different years, spanning different eras/cultures where genuinely possible. Never invent an event.\n\n` +
      `Return JSON: {"date": "${date.toISOString().slice(0, 10)}", "events": [{"year": "...", "era": "...", "culture": "...", "event": "..."}], "gaps": ["..."]}`,
  );
}
