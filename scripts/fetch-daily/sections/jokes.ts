import { synthesizeJson } from "../lib/anthropic";
import type { JokeDialogue } from "../../../lib/types";

export async function fetchJokesSectionData(
  todaysStories: { title: string; summary: string }[],
): Promise<{ dialogues: JokeDialogue[] }> {
  return synthesizeJson<{ dialogues: JokeDialogue[] }>(
    "You write 'The Wit Column' for a personal newspaper: 4 short two-character comic dialogues (setup/punchline), each riffing on one of today's actual stories. Keep the humor observational, not mean-spirited. Never invent facts about the stories beyond what's given.",
    `Today's stories:\n${todaysStories.map((s) => `- ${s.title}: ${s.summary}`).join("\n")}\n\n` +
      `Return JSON: {"dialogues": [{"characterA": "A", "characterB": "B", "setup": "...", "punchline": "...", "tiedToStory": "..."}]} with exactly 4 dialogues, each tied to a different story where possible.`,
  );
}
