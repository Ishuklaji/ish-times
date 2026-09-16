import rawEdition from "@/data/current.json";
import rawRunLog from "@/data/run-log.json";
import type { Edition, RunLog } from "./types";

export function getEdition(): Edition {
  return rawEdition as Edition;
}

export function getLatestRunLog(): RunLog {
  return rawRunLog as RunLog;
}
