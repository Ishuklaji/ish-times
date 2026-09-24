import { fetchJson } from "./http";
import { ENV } from "../config";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  sourceName: string;
}

interface NewsApiResponse {
  status: string;
  articles: { title: string; description: string | null; url: string; publishedAt: string; source: { name: string } }[];
}

interface GNewsResponse {
  articles: { title: string; description: string; url: string; publishedAt: string; source: { name: string } }[];
}

async function searchNewsApi(query: string): Promise<NewsArticle[]> {
  if (!ENV.newsApiKey) return [];
  const url =
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}` +
    `&language=en&sortBy=publishedAt&pageSize=5&apiKey=${ENV.newsApiKey}`;
  try {
    const data = await fetchJson<NewsApiResponse>(url);
    return data.articles.map((a) => ({
      title: a.title,
      description: a.description ?? "",
      url: a.url,
      publishedAt: a.publishedAt,
      sourceName: a.source.name,
    }));
  } catch (err) {
    console.error(`NewsAPI request failed for "${query}": ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

async function searchGNews(query: string): Promise<NewsArticle[]> {
  if (!ENV.gNewsKey) return [];
  const url =
    `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}` +
    `&lang=en&max=5&apikey=${ENV.gNewsKey}`;
  try {
    const data = await fetchJson<GNewsResponse>(url);
    return data.articles.map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      publishedAt: a.publishedAt,
      sourceName: a.source.name,
    }));
  } catch (err) {
    console.error(`GNews request failed for "${query}": ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

/**
 * Try each narrow query in order, returning the first that yields results.
 * Never falls back to a generic query — an exhausted list means "nothing
 * genuinely new today" for this section, which the caller should treat as
 * a forecast case rather than widening the search.
 */
export async function searchNarrowNews(queries: string[]): Promise<{ query: string; articles: NewsArticle[] } | null> {
  for (const query of queries) {
    let articles = await searchNewsApi(query);
    if (articles.length === 0) articles = await searchGNews(query);
    if (articles.length > 0) return { query, articles };
  }
  return null;
}
