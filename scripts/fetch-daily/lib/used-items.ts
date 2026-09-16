import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface UsedItems {
  words: string[];
  books: string[];
  shlokas: string[];
  concepts: string[];
  psychologyPrinciples: string[];
}

const FILE_PATH = join(__dirname, "..", "..", "..", "data", "used-items.json");

export function loadUsedItems(): UsedItems {
  try {
    return JSON.parse(readFileSync(FILE_PATH, "utf-8"));
  } catch {
    return { words: [], books: [], shlokas: [], concepts: [], psychologyPrinciples: [] };
  }
}

export function saveUsedItems(items: UsedItems): void {
  writeFileSync(FILE_PATH, JSON.stringify(items, null, 2));
}

export function markUsed(items: UsedItems, key: keyof UsedItems, value: string): void {
  if (!items[key].includes(value)) {
    items[key].push(value);
  }
}
