export const WANTED_STACK = ["react", "next.js", "nextjs", "typescript", "node", "node.js"];
export const EXCLUDED_STACK = ["python", "django", "golang", " go ", "kubernetes", "vue", "angular"];

export function stackMatches(text: string): { relevant: boolean; stack: string[] } {
  const haystack = text.toLowerCase();
  const stack = WANTED_STACK.filter((w) => haystack.includes(w));
  const excluded = EXCLUDED_STACK.some((w) => haystack.includes(w));
  return { relevant: stack.length > 0 && !excluded, stack };
}

export function isBerlinOrRemote(location: string): boolean {
  return /berlin|remote|germany/i.test(location);
}
