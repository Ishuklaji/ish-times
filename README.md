# The Ish Times

A personal daily newspaper — 28 sections, swiped card by card, refreshed every morning with no manual trigger.

## How it works

- **Frontend** — Next.js (App Router) + TypeScript + Tailwind. `app/page.tsx` reads `data/current.json` (imported as a typed JSON module) and renders it through `components/CardDeck.tsx`, a CSS scroll-snap swipe deck — nothing is hardcoded, every section is driven by that JSON file.
- **Content store** — plain JSON committed to git: `data/current.json` (today's edition), `data/run-log.json` (per-section fresh/forecast/error status for the run), `data/used-items.json` (words/books/shlokas/concepts already used, so nothing repeats).
- **Daily job** — `.github/workflows/daily-fetch.yml` runs `scripts/fetch-daily/index.ts` once a day (04:00 UTC), which fetches real news/market/job data, synthesizes structured section JSON via the free-tier Gemini API, decides fresh-vs-forecast per section, writes the three `data/*.json` files, and commits + pushes them. Vercel is connected to this repo's default branch, so that push triggers an automatic redeploy — the site is current by the time you open it.
- **Debug view** — `/admin` renders the latest `run-log.json`: which sections got genuinely fresh data vs. fell back to a forecast, and any errors from that run.

## Local setup

```bash
npm install
npm run seed      # writes a placeholder "seed" edition to data/ if you don't have one yet
npm run dev
```

Open http://localhost:3000. Visit `/admin` for the pipeline debug view.

## Running the daily fetch locally

```bash
cp .env.example .env
# fill in the keys below
npm run fetch:daily
```

Required API keys (see `.env.example`):

| Key | Used for | Get one at |
|---|---|---|
| `NEWSAPI_KEY` | Politics/war/tech/trade/markets narrow-query news | https://newsapi.org |
| `GNEWS_KEY` | Fallback news source (optional) | https://gnews.io |
| `ALPHAVANTAGE_KEY` | US/Germany/EU/India index quotes (ETF proxies) | https://www.alphavantage.co/support/#api-key |
| `GEMINI_API_KEY` | Synthesizes every section's structured JSON from fetched facts; generates evergreen sections (word bank, shloka, astrology, etc.). Free tier, no billing required. | https://aistudio.google.com/apikey |

No key is required for the IT Job Market section or the Astrology Corner's transit math (computed locally via `astronomy-engine`, no API).

**IT Job Market sourcing, and why LinkedIn/Xing/StepStone aren't scraped:** none of those three expose a public API for job search, and scraping their result pages violates their terms of service (LinkedIn in particular actively blocks and pursues this) — so the daily job can't pull actual listings from them. What it does instead: `scripts/fetch-daily/lib/companyBoards.ts` queries each company's own public job-board API directly (Greenhouse/Lever — data the company itself opts into exposing programmatically, not scraped), which is the real "private company site" source of postings, filtered to React/Next.js/TypeScript/Node + Berlin/remote and individually HTTP-verified. It falls back to the free Arbeitnow aggregator API to fill out the remaining slots. LinkedIn/Xing/StepStone are covered as the three permanent search-filter links instead (a link can't 404 the way a scraped listing can go stale). The company list in `companyBoards.ts` is a curated starting set — ATS slugs drift, so add/remove companies there as needed; a wrong slug just gets silently skipped, never a fabricated posting.

If a key is missing, the affected sections don't crash the run — they're logged as errors in `run-log.json` and the previous day's content is carried forward unchanged (visible on `/admin`).

## Deploying

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Import it into Vercel (vercel.com/new) — no special build config needed.
3. In the GitHub repo, add the four API keys above as **Actions secrets** (Settings → Secrets and variables → Actions). This is what `.github/workflows/daily-fetch.yml` uses.
4. That's it — the workflow runs daily, commits fresh `data/*.json`, and Vercel redeploys automatically on every push.

You can also trigger a run manually from the Actions tab (`workflow_dispatch`) instead of waiting for the schedule.

## Astrology natal chart

The Vedic natal chart (Cancer Ascendant, exalted Moon in Taurus/11th, yogakaraka Mars in Pisces/9th, Jupiter+Saturn in Aries/10th, Rahu in 1st, running Rahu Mahadasha/Rahu-Mars Antardasha) is a fixed constant in `lib/natal-chart.ts` — it's never asked for again. Each day, `scripts/fetch-daily/lib/astrology.ts` computes real sidereal planetary positions (Lahiri ayanamsa) for today and works out which houses they fall in relative to that chart, then asks Gemini to write the interpretive summary from those real computed positions. The tarot half draws genuinely at random from a full 78-card deck in `scripts/fetch-daily/lib/tarot-deck.ts`.

## Project structure

```
app/                     # Next.js routes: / (the paper), /admin (pipeline debug)
components/              # Masthead, NavBar, CardDeck, SectionCardShell, SectionRouter, sections/*
lib/                     # Shared types, section registry (styling/layout per section), natal chart, content loader
data/                    # current.json, run-log.json, used-items.json — the actual content store
scripts/generate-seed.ts # One-time placeholder edition generator
scripts/fetch-daily/     # The daily job: config, lib/ (news, markets, jobs, llm, astrology, forecast), sections/*
.github/workflows/       # daily-fetch.yml cron
```
