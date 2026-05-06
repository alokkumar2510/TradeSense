import type { Env } from "../types";

const BASE = "https://financialmodelingprep.com/api";

/** Raw quote from FMP */
interface FMPQuote {
  symbol:          string;
  name:            string;
  price:           number;
  changesPercentage: number;
  change:          number;
  dayLow:          number;
  dayHigh:         number;
  open:            number;
  volume:          number;
  marketCap:       number;
  pe:              number;
  timestamp:       number;
  exchange:        string;
}

interface FMPHistorical {
  date:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

interface FMPNews {
  title:         string;
  url:           string;
  publishedDate: string;
  site:          string;
  image:         string;
  text:          string;
}

interface FMPSearchResult {
  symbol:      string;
  name:        string;
  stockExchange: string;
  exchangeShortName: string;
}

export async function fetchQuote(symbol: string, env: Env): Promise<FMPQuote> {
  const res = await fetch(
    `${BASE}/v3/quote/${encodeURIComponent(symbol)}?apikey=${env.FMP_API_KEY}`
  );

  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP error: ${res.status}`);

  const data = await res.json<FMPQuote[]>();
  if (!data || data.length === 0) throw new Error("SYMBOL_NOT_FOUND");

  return data[0];
}

export async function fetchHistory(
  symbol: string,
  env: Env,
  days = 180
): Promise<FMPHistorical[]> {
  const to   = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);

  const res = await fetch(
    `${BASE}/v3/historical-price-full/${encodeURIComponent(symbol)}` +
    `?from=${from.toISOString().split("T")[0]}&to=${to.toISOString().split("T")[0]}` +
    `&apikey=${env.FMP_API_KEY}`
  );

  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP history error: ${res.status}`);

  const data = await res.json<{ historical: FMPHistorical[] }>();
  return (data.historical ?? []).reverse(); // oldest → newest for charts
}

export async function fetchNews(symbol: string, env: Env, limit = 10): Promise<FMPNews[]> {
  const res = await fetch(
    `${BASE}/v3/stock_news?tickers=${encodeURIComponent(symbol)}&limit=${limit}&apikey=${env.FMP_API_KEY}`
  );

  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP news error: ${res.status}`);

  return res.json<FMPNews[]>();
}

export async function searchSymbols(query: string, env: Env): Promise<FMPSearchResult[]> {
  const res = await fetch(
    `${BASE}/v3/search?query=${encodeURIComponent(query)}&limit=10&apikey=${env.FMP_API_KEY}`
  );

  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP search error: ${res.status}`);

  return res.json<FMPSearchResult[]>();
}
