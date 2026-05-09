import type { Env } from "../types";

const BASE = "https://financialmodelingprep.com/stable";

/** Raw quote from FMP */
interface FMPQuote {
  symbol:          string;
  name:            string;
  price:           number;
  changePercent:   number;
  change:          number;
  low:             number;
  high:            number;
  open:            number;
  volume:          number;
  marketCap:       number;
  pe:              number;
  timestamp:       number;
  exchange:        string;
}

interface FMPHistorical {
  time:   number;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export async function fetchQuote(symbol: string, env: Env): Promise<FMPQuote> {
  const res = await fetch(
    `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${env.FMP_API_KEY.trim()}`
  );

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) {
    if (res.status === 402 || res.status === 403 || res.status === 404) {
      console.warn(`FMP quote ${res.status} for ${symbol}, falling back to Yahoo`);
      return fetchQuoteYahoo(symbol);
    }
    throw new Error(`FMP quote error: ${res.status}`);
  }

  // FMP /stable/quote returns either a single object OR an array depending on plan
  const raw = await res.json<any>();
  const q = Array.isArray(raw) ? raw[0] : raw;
  if (!q || !q.symbol) {
    console.warn(`FMP quote empty for ${symbol}, falling back to Yahoo`);
    return fetchQuoteYahoo(symbol);
  }

  return {
    symbol: q.symbol,
    name: q.name || q.symbol,
    price: q.price || 0,
    changePercent: q.changePercentage ?? q.changesPercentage ?? 0,
    change: q.change || 0,
    low: q.dayLow || 0,
    high: q.dayHigh || 0,
    open: q.open || 0,
    volume: q.volume || 0,
    marketCap: q.marketCap || 0,
    pe: q.pe || 0,
    timestamp: q.timestamp || Math.floor(Date.now() / 1000),
    exchange: q.exchange || "",
  };
}

/** Yahoo Finance fallback for quote data */
async function fetchQuoteYahoo(symbol: string): Promise<FMPQuote> {
  const res = await fetch(
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }
  );
  if (!res.ok) throw new Error("SYMBOL_NOT_FOUND");

  const data = await res.json<any>();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error("SYMBOL_NOT_FOUND");

  const price       = meta.regularMarketPrice   || 0;
  const prevClose   = meta.chartPreviousClose    || meta.previousClose || price;
  const change      = price - prevClose;
  const changePct   = prevClose ? (change / prevClose) * 100 : 0;

  return {
    symbol:        meta.symbol || symbol,
    name:          meta.longName || meta.shortName || symbol,
    price,
    changePercent: changePct,
    change,
    low:           meta.regularMarketDayLow  || price,
    high:          meta.regularMarketDayHigh || price,
    open:          meta.regularMarketOpen    || price,
    volume:        meta.regularMarketVolume  || 0,
    marketCap:     meta.marketCap            || 0,
    pe:            0,
    timestamp:     meta.regularMarketTime    || Math.floor(Date.now() / 1000),
    exchange:      meta.exchangeName         || meta.fullExchangeName || "",
  };
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
    `${BASE}/historical-price-eod/full?symbol=${encodeURIComponent(symbol)}` +
    `&from=${from.toISOString().split("T")[0]}&to=${to.toISOString().split("T")[0]}` +
    `&apikey=${env.FMP_API_KEY.trim()}`
  );

  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) {
    if (res.status === 402 || res.status === 403) {
      console.warn(`FMP premium error for history ${symbol}, falling back to Yahoo Finance`);
      return fetchHistoryYahoo(symbol, days);
    }
    throw new Error(`FMP history error: ${res.status}`);
  }

  const data = await res.json<any[]>();
  if (!Array.isArray(data)) return [];
  
  // Normalize each date string ("2025-11-10") to midnight UTC seconds
  // then deduplicate so lightweight-charts never gets two bars with the same time.
  const seen = new Set<number>();
  return data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce<FMPHistorical[]>((acc, bar) => {
      const t = Math.floor(new Date(bar.date + "T00:00:00Z").getTime() / 1000);
      if (!seen.has(t) && bar.close) {
        seen.add(t);
        acc.push({ time: t, open: bar.open, high: bar.high, low: bar.low, close: bar.close, volume: bar.volume });
      }
      return acc;
    }, []);
}

async function fetchHistoryYahoo(symbol: string, days: number): Promise<FMPHistorical[]> {
  const range = days <= 5 ? "5d" : days <= 30 ? "1mo" : days <= 90 ? "3mo" : days <= 180 ? "6mo" : "1y";
  const res = await fetch(
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }
  );
  if (!res.ok) throw new Error(`Yahoo Finance history error: ${res.status}`);
  const data = await res.json<any>();
  const result = data?.chart?.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) return [];
  
  const timestamps = result.timestamp as number[];
  const quote = result.indicators.quote[0];
  
  const seen = new Set<number>();
  const history: FMPHistorical[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = quote.close[i];
    if (close === null || close === undefined) continue;
    const t = Math.floor(timestamps[i] / 86400) * 86400;
    if (seen.has(t)) continue;
    seen.add(t);
    history.push({
      time: t,
      open:   quote.open[i]   ?? close,
      high:   quote.high[i]   ?? close,
      low:    quote.low[i]    ?? close,
      close,
      volume: quote.volume[i] ?? 0,
    });
  }
  return history;
}

/** ─── Multi-Timeframe History (Yahoo Finance) ──────────────────────────────
 *
 * tf     range    interval  description
 * ─────  ───────  ────────  ──────────────────────────
 * 1D     1d       5m        Today intraday
 * 5D     5d       15m       Last 5 days
 * 1M     1mo      1d        Last month, daily candles
 * 3M     3mo      1d        Last quarter
 * 6M     6mo      1d        6-month daily
 * 1Y     1y       1d        Full year daily
 * 5Y     5y       1wk       5-year weekly candles
 * MAX    max      1mo       All history, monthly candles
 */
export type Timeframe = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

const TF_MAP: Record<Timeframe, { range: string; interval: string; intraday: boolean }> = {
  "1D":  { range: "1d",  interval: "5m",   intraday: true  },
  "5D":  { range: "5d",  interval: "15m",  intraday: true  },
  "1M":  { range: "1mo", interval: "1d",   intraday: false },
  "3M":  { range: "3mo", interval: "1d",   intraday: false },
  "6M":  { range: "6mo", interval: "1d",   intraday: false },
  "1Y":  { range: "1y",  interval: "1d",   intraday: false },
  "5Y":  { range: "5y",  interval: "1wk",  intraday: false },
  "MAX": { range: "max", interval: "1mo",  intraday: false },
};

export async function fetchHistoryTF(symbol: string, tf: Timeframe): Promise<FMPHistorical[]> {
  const { range, interval, intraday } = TF_MAP[tf] ?? TF_MAP["6M"];

  const res = await fetch(
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } }
  );
  if (!res.ok) throw new Error(`Yahoo TF history error: ${res.status} for ${symbol}`);

  const data = await res.json<any>();
  const result = data?.chart?.result?.[0];
  if (!result?.timestamp || !result?.indicators?.quote?.[0]) return [];

  const timestamps = result.timestamp as number[];
  const q = result.indicators.quote[0];
  const seen = new Set<number>();
  const bars: FMPHistorical[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close = q.close?.[i];
    if (close == null) continue;
    // Intraday: keep raw unix timestamp; daily+: floor to midnight UTC
    const t = intraday ? timestamps[i] : Math.floor(timestamps[i] / 86400) * 86400;
    if (seen.has(t)) continue;
    seen.add(t);
    bars.push({
      time:   t,
      open:   q.open?.[i]   ?? close,
      high:   q.high?.[i]   ?? close,
      low:    q.low?.[i]    ?? close,
      close,
      volume: q.volume?.[i] ?? 0,
    });
  }
  return bars.sort((a, b) => a.time - b.time);
}

// News endpoint is restricted on the free tier of FMP's stable API.
// We keep the Yahoo Finance fallback for news.
export async function fetchNews(symbol: string, env: Env, limit = 10): Promise<FMPNews[]> {
  const res = await fetch(
    `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&newsCount=${limit}`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "application/json" } }
  );

  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP news error: ${res.status}`);

  const data = await res.json<any>();
  if (!data || !data.news) return [];
  
  return data.news.map((n: any) => ({
    title: n.title,
    url: n.link,
    publishedDate: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
    site: n.publisher || "Yahoo Finance",
    image: n.thumbnail?.resolutions?.[0]?.url || "",
    text: n.title
  }));
}

export async function searchSymbols(query: string, env: Env): Promise<FMPSearchResult[]> {
  const res = await fetch(
    `${BASE}/search-symbol?query=${encodeURIComponent(query)}&limit=10&apikey=${env.FMP_API_KEY.trim()}`
  );

  if (res.status === 429) throw new Error("FMP_RATE_LIMITED");
  if (!res.ok) throw new Error(`FMP search error: ${res.status}`);

  const data = await res.json<any[]>();
  if (!Array.isArray(data)) return [];
  
  return data.map((q: any) => ({
    symbol: q.symbol,
    name: q.name,
    stockExchange: q.exchangeFullName || q.exchange || "",
    exchangeShortName: q.exchange || ""
  }));
}

