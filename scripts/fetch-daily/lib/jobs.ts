import { fetchJson, verifyUrlResolves } from "./http";
import { stackMatches, isBerlinOrRemote } from "./jobFilters";
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

function isRelevant(job: ArbeitnowJob): { relevant: boolean; stack: string[] } {
  const { relevant, stack } = stackMatches(`${job.title} ${job.tags.join(" ")}`);
  const locationOk = isBerlinOrRemote(job.location) || job.tags.some((t) => /remote/i.test(t));
  return { relevant: relevant && locationOk, stack };
}

/**
 * Fetch candidate postings, then individually verify each one resolves
 * (HTTP 200) before it is ever stored as "verified" — a search hit alone
 * is never sufficient.
 */
export async function fetchVerifiedJobs(limit = 10): Promise<JobPosting[]> {
  const data = await fetchJson<ArbeitnowResponse>("https://www.arbeitnow.com/api/job-board-api");
  const candidates = data.data
    .map((job) => ({ job, check: isRelevant(job) }))
    .filter((c) => c.check.relevant)
    .slice(0, limit * 2);

  const verified: JobPosting[] = [];
  for (const { job, check } of candidates) {
    if (verified.length >= limit) break;
    const ok = await verifyUrlResolves(job.url);
    if (ok) {
      verified.push({
        title: job.title,
        company: job.company_name,
        location: job.location,
        stack: check.stack,
        url: job.url,
        verifiedAt: new Date().toISOString(),
      });
    }
  }
  return verified;
}
