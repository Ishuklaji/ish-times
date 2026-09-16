import { fetchVerifiedJobs } from "../lib/jobs";
import type { JobsBody } from "../../../lib/types";

const SEARCH_LINKS = [
  { label: "LinkedIn — React/Next.js/TypeScript, Berlin", url: "https://www.linkedin.com/jobs/search/?keywords=React%20Next.js%20TypeScript&location=Berlin" },
  { label: "Xing — React/Next.js/TypeScript, Berlin", url: "https://www.xing.com/jobs/search?keywords=React%20Next.js%20TypeScript&location=Berlin" },
  { label: "StepStone — React/Next.js/TypeScript, Berlin", url: "https://www.stepstone.de/jobs/react-next-js-typescript/in-berlin" },
];

export async function fetchJobsSectionData(): Promise<JobsBody> {
  const postings = await fetchVerifiedJobs(10);
  return { postings, searchLinks: SEARCH_LINKS };
}
