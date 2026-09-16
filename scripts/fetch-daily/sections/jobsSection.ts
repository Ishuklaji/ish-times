import { fetchVerifiedJobs } from "../lib/jobs";
import { fetchCompanyBoardJobs } from "../lib/companyBoards";
import type { JobsBody } from "../../../lib/types";

const SEARCH_LINKS = [
  { label: "LinkedIn — React/Next.js/TypeScript, Berlin", url: "https://www.linkedin.com/jobs/search/?keywords=React%20Next.js%20TypeScript&location=Berlin" },
  { label: "Xing — React/Next.js/TypeScript, Berlin", url: "https://www.xing.com/jobs/search?keywords=React%20Next.js%20TypeScript&location=Berlin" },
  { label: "StepStone — React/Next.js/TypeScript, Berlin", url: "https://www.stepstone.de/jobs/react-next-js-typescript/in-berlin" },
];

const TOTAL_POSTINGS = 10;

export async function fetchJobsSectionData(): Promise<JobsBody> {
  // Prioritize postings pulled directly from each company's own public job
  // board (Greenhouse/Lever) over the generic aggregator, since those are
  // the actual "private company site" listings.
  const companyJobs = await fetchCompanyBoardJobs(TOTAL_POSTINGS);
  const remaining = TOTAL_POSTINGS - companyJobs.length;
  const aggregatorJobs = remaining > 0 ? await fetchVerifiedJobs(remaining) : [];

  const seen = new Set<string>();
  const postings = [...companyJobs, ...aggregatorJobs].filter((job) => {
    if (seen.has(job.url)) return false;
    seen.add(job.url);
    return true;
  });

  return { postings, searchLinks: SEARCH_LINKS };
}
