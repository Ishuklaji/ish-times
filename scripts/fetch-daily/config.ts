export const ENV = {
  newsApiKey: process.env.NEWSAPI_KEY,
  gNewsKey: process.env.GNEWS_KEY,
  alphaVantageKey: process.env.ALPHAVANTAGE_KEY,
  // Google AI Studio free tier — https://aistudio.google.com/apikey (no billing required).
  geminiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
};

/** Fixed personalization context injected into every synthesis prompt. */
export const PROFILE_CONTEXT =
  "The reader is Ish, a Berlin-based Indian software developer working with the MERN stack, Next.js, and TypeScript, currently building two side projects: Forgey and Prepty.";

/**
 * Narrow, named-entity/named-official/exact-event queries per news-tied
 * section — never generic "news today" style queries. The daily run picks
 * the first query that returns genuinely new results.
 */
export const NEWS_QUERIES: Record<string, string[]> = {
  "global-politics": [
    '"United Nations Security Council" resolution',
    '"Volodymyr Zelensky" OR "Vladimir Putin" summit',
    '"Xi Jinping" state visit',
    '"NATO Secretary General" statement',
  ],
  "indian-politics": [
    '"Narendra Modi" Lok Sabha',
    '"Parliament of India" session',
    '"Election Commission of India"',
    '"Amit Shah" OR "Rajnath Singh" statement',
  ],
  "germany-eu-politics": [
    '"Friedrich Merz" Bundestag',
    '"European Commission" Ursula von der Leyen',
    '"Bundestag" vote',
    '"European Council" summit',
  ],
  "war-conflict": [
    '"Ministry of Defence" Ukraine strike',
    '"Israel Defense Forces" Gaza',
    '"ceasefire" negotiations named',
  ],
  tech: [
    '"OpenAI" OR "Anthropic" OR "Google DeepMind" announcement',
    '"Apple" OR "Microsoft" product launch',
    '"European Union" AI Act enforcement',
  ],
  trade: [
    '"World Trade Organization" ruling',
    '"tariff" European Union United States named',
    '"trade agreement" India European Union',
  ],
  "business-markets": [
    '"Federal Reserve" interest rate decision',
    '"European Central Bank" rate decision',
    '"Reserve Bank of India" monetary policy',
  ],
};

export const COMPANY_NEWS_QUERIES: { company: string; region: "US" | "EU" | "Germany" | "India" }[] = [
  { company: "Apple", region: "US" },
  { company: "SAP", region: "Germany" },
  { company: "ASML", region: "EU" },
  { company: "Reliance Industries", region: "India" },
  { company: "Microsoft", region: "US" },
];

export const MARKET_SYMBOLS: { name: string; region: "US" | "Germany" | "EU" | "India"; symbol: string; note: string }[] = [
  { name: "S&P 500 (SPY proxy)", region: "US", symbol: "SPY", note: "SPDR S&P 500 ETF Trust" },
  { name: "Germany (EWG proxy)", region: "Germany", symbol: "EWG", note: "iShares MSCI Germany ETF" },
  { name: "Europe (VGK proxy)", region: "EU", symbol: "VGK", note: "Vanguard FTSE Europe ETF" },
  { name: "India (INDA proxy)", region: "India", symbol: "INDA", note: "iShares MSCI India ETF" },
];
