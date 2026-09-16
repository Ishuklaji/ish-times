import { fetchJson, verifyUrlResolves } from "./http";
import { stackMatches, isBerlinOrRemote } from "./jobFilters";
import type { JobPosting } from "../../../lib/types";

/**
 * Curated Berlin/Germany tech companies that publish their own job board
 * through a public, unauthenticated ATS API (Greenhouse or Lever) — this is
 * data the company itself opts into exposing programmatically, not scraped.
 * LinkedIn/Xing/StepStone have no equivalent public API and disallow
 * scraping their search results, so they're covered as durable search
 * links instead (see jobsSection.ts).
 *
 * ATS slugs drift when companies switch providers or rename boards — a
 * wrong slug just 404s and that company is silently skipped (see
 * fetchFromBoard below), it never produces fabricated postings.
 */
const COMPANY_BOARDS: { company: string; ats: "greenhouse" | "lever"; slug: string }[] = [
  { company: "N26", ats: "greenhouse", slug: "n26" },
  { company: "Personio", ats: "greenhouse", slug: "personio" },
  { company: "GetYourGuide", ats: "greenhouse", slug: "getyourguide" },
  { company: "Contentful", ats: "greenhouse", slug: "contentful" },
  { company: "Babbel", ats: "greenhouse", slug: "babbel" },
  { company: "Trade Republic", ats: "greenhouse", slug: "traderepublic" },
  { company: "Delivery Hero", ats: "greenhouse", slug: "deliveryhero" },
  { company: "Grover", ats: "greenhouse", slug: "grover" },
  { company: "Taxfix", ats: "greenhouse", slug: "taxfix" },
  { company: "FlixBus", ats: "greenhouse", slug: "flixbus" },
  { company: "Forto", ats: "lever", slug: "forto" },
  { company: "SoundCloud", ats: "lever", slug: "soundcloud" },
];

interface GreenhouseJob {
  id: number;
  title: string;
  location: { name: string };
  absolute_url: string;
}
interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

interface LeverJob {
  text: string;
  categories: { location?: string };
  hostedUrl: string;
}

async function fetchFromBoard(board: (typeof COMPANY_BOARDS)[number]): Promise<{ title: string; location: string; url: string }[]> {
  try {
    if (board.ats === "greenhouse") {
      const data = await fetchJson<GreenhouseResponse>(
        `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs`,
      );
      return data.jobs.map((j) => ({ title: j.title, location: j.location.name, url: j.absolute_url }));
    }
    const data = await fetchJson<LeverJob[]>(`https://api.lever.co/v0/postings/${board.slug}?mode=json`);
    return data.map((j) => ({ title: j.text, location: j.categories.location ?? "", url: j.hostedUrl }));
  } catch {
    // Slug doesn't resolve, board API is down, or company switched ATS — skip silently.
    return [];
  }
}

/**
 * Pull real, current postings directly from each company's own public job
 * board API, filter to the wanted stack + Berlin/remote, and individually
 * verify each URL resolves before returning it.
 */
export async function fetchCompanyBoardJobs(limit: number): Promise<JobPosting[]> {
  const verified: JobPosting[] = [];

  for (const board of COMPANY_BOARDS) {
    if (verified.length >= limit) break;
    const postings = await fetchFromBoard(board);

    for (const posting of postings) {
      if (verified.length >= limit) break;
      const { relevant, stack } = stackMatches(posting.title);
      if (!relevant || !isBerlinOrRemote(posting.location)) continue;

      const ok = await verifyUrlResolves(posting.url);
      if (ok) {
        verified.push({
          title: posting.title,
          company: board.company,
          location: posting.location || "Berlin",
          stack,
          url: posting.url,
          verifiedAt: new Date().toISOString(),
        });
      }
    }
  }

  return verified;
}
