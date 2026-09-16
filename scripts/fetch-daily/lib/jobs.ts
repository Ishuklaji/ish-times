import { fetchJson, verifyUrlResolves } from "./http";
import type { JobPosting } from "../../../lib/types";

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  location: string;
  url: string;
  tags: string[];
  job_types: string[];
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

const WANTED = ["react", "next.js", "nextjs", "typescript", "node", "node.js"];
const EXCLUDED = ["python", "django", "golang", " go ", "kubernetes", "vue", "angular"];

function isRelevant(job: ArbeitnowJob): boolean {
  const haystack = `${job.title} ${job.tags.join(" ")}`.toLowerCase();
  const isBerlinOrRemote = /berlin|remote/i.test(job.location) || job.tags.some((t) => /remote/i.test(t));
  const matchesWanted = WANTED.some((w) => haystack.includes(w));
  const matchesExcluded = EXCLUDED.some((w) => haystack.includes(w));
  return isBerlinOrRemote && matchesWanted && !matchesExcluded;
}

/**
 * Fetch candidate postings, then individually verify each one resolves
 * (HTTP 200) before it is ever stored as "verified" — a search hit alone
 * is never sufficient.
 */
export async function fetchVerifiedJobs(limit = 10): Promise<JobPosting[]> {
  const data = await fetchJson<ArbeitnowResponse>("https://www.arbeitnow.com/api/job-board-api");
  const candidates = data.data.filter(isRelevant).slice(0, limit * 2);

  const verified: JobPosting[] = [];
  for (const job of candidates) {
    if (verified.length >= limit) break;
    const ok = await verifyUrlResolves(job.url);
    if (ok) {
      verified.push({
        title: job.title,
        company: job.company_name,
        location: job.location,
        stack: job.tags.filter((t) => WANTED.some((w) => t.toLowerCase().includes(w))),
        url: job.url,
        verifiedAt: new Date().toISOString(),
      });
    }
  }
  return verified;
}
