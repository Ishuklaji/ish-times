import { fetchJson } from "./http";
import { ENV, MARKET_SYMBOLS } from "../config";
import type { MarketIndex } from "../../../lib/types";

interface GlobalQuoteResponse {
  "Global Quote"?: {
    "05. price": string;
    "07. latest trading day": string;
    "09. change": string;
    "10. change percent": string;
  };
  Note?: string; // rate-limit message
  Information?: string;
}

export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  const today = new Date().toISOString().slice(0, 10);
  const results: MarketIndex[] = [];

  for (const sym of MARKET_SYMBOLS) {
    if (!ENV.alphaVantageKey) {
      results.push({
        name: sym.name,
        region: sym.region,
        value: "—",
        change: "—",
        direction: "flat",
        asOf: today,
        marketClosed: true,
        closedReason: "ALPHAVANTAGE_KEY not configured",
      });
      continue;
    }
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym.symbol}&apikey=${ENV.alphaVantageKey}`;
      const data = await fetchJson<GlobalQuoteResponse>(url);
      const quote = data["Global Quote"];
      if (!quote || !quote["05. price"]) {
        throw new Error(data.Note || data.Information || "Empty quote response");
      }
      const changePct = parseFloat(quote["10. change percent"]);
      const asOf = quote["07. latest trading day"];
      results.push({
        name: sym.name,
        region: sym.region,
        value: quote["05. price"],
        change: quote["10. change percent"],
        direction: changePct > 0 ? "up" : changePct < 0 ? "down" : "flat",
        asOf,
        marketClosed: asOf !== today,
        closedReason: asOf !== today ? "Markets closed as of latest available quote" : undefined,
      });
    } catch (err) {
      results.push({
        name: sym.name,
        region: sym.region,
        value: "—",
        change: "—",
        direction: "flat",
        asOf: today,
        marketClosed: true,
        closedReason: err instanceof Error ? err.message : "Fetch failed",
      });
    }
  }

  return results;
}
