import { synthesizeJson } from "../lib/llm";
import type { AdviceBody } from "../../../lib/types";

export type AdviceKind = "life-style-confidence" | "understand-people";

const PROMPTS: Record<AdviceKind, string> = {
  "life-style-confidence":
    "You write 'Life, Style & Confidence': genuine, practical advice on giving compliments, holding a conversation, and personal style. Never profile any one gender's 'behavior' as a study subject — write advice that applies to anyone.",
  "understand-people":
    "You write 'Understand People — Daily': 3 real, established psychology principles (e.g. from social psychology, not invented), each explained plainly with a everyday example. Never repeat an already-used principle.",
};

export async function fetchAdviceSectionData(
  kind: AdviceKind,
  usedPrinciples: string[],
): Promise<AdviceBody> {
  return synthesizeJson<AdviceBody>(
    PROMPTS[kind],
    (kind === "understand-people"
      ? `Already used (never reuse any of these): ${usedPrinciples.join(", ") || "none yet"}\n\n`
      : "") +
      `Return JSON: {"intro": "...", "points": [{"title": "...", "detail": "..."}]} with 3 points.`,
  );
}
