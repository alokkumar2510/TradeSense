import type { Env } from "../types";
import { fetchQuote, fetchHistory, fetchHistoryTF, searchSymbols, type Timeframe } from "../services/fmp";
import { fetchRSI, fetchMACD } from "../services/alphaVantage";
import { generateSignal } from "../services/signalEngine";
import { computeAnalytics } from "../services/analyticsEngine";
import { getOrFetch, TTL } from "../lib/cache";
import { jsonResponse, errorResponse } from "../lib/response";

export async function handleQuote(symbol: string, env: Env): Promise<Response> {
  try {
    const { data: quote } = await getOrFetch(env, `quote:v3:${symbol}`, TTL.QUOTE, () => fetchQuote(symbol, env));
    return jsonResponse({ ok: true, data: quote });
  } catch (e: unknown) {
    console.error("Quote fetch error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "SYMBOL_NOT_FOUND") return errorResponse("Symbol not found", "NOT_FOUND", 404);
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited, cached data unavailable", "RATE_LIMITED", 429);
    return errorResponse(`Failed to fetch quote: ${msg}`, "SERVER_ERROR", 500);
  }
}

/** History with optional ?tf=1D|5D|1M|3M|6M|1Y|5Y|MAX */
export async function handleHistory(symbol: string, env: Env, url: URL): Promise<Response> {
  const tf = (url.searchParams.get("tf") ?? "6M").toUpperCase() as Timeframe;
  const VALID: Timeframe[] = ["1D","5D","1M","3M","6M","1Y","5Y","MAX"];
  const safeTF: Timeframe = VALID.includes(tf) ? tf : "6M";

  try {
    // Use TF-specific cache key so different timeframes don't overwrite each other
    const cacheKey = `history:tf:${symbol}:${safeTF}`;
    const ttl = safeTF === "1D" ? TTL.QUOTE : TTL.HISTORY; // intraday refreshes faster
    const { data: bars } = await getOrFetch(env, cacheKey, ttl, () => fetchHistoryTF(symbol, safeTF));
    return jsonResponse({ ok: true, data: bars, meta: { tf: safeTF, count: bars.length } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error(`History TF error [${symbol}:${safeTF}]:`, e);
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited", "RATE_LIMITED", 429);
    return errorResponse(`Failed to fetch history: ${msg}`, "SERVER_ERROR", 500);
  }
}

/** New unified analysis endpoint — pure OHLCV, no Alpha Vantage dependency */
export async function handleAnalysis(symbol: string, env: Env): Promise<Response> {
  try {
    const { data: bars } = await getOrFetch(
      env, `history:v5:${symbol}`, TTL.HISTORY,
      () => fetchHistory(symbol, env, 180)
    );

    if (!bars || bars.length < 30) {
      return errorResponse("Insufficient historical data", "INSUFFICIENT_DATA", 422);
    }

    const analytics = computeAnalytics(bars);
    return jsonResponse({ ok: true, data: analytics });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Analysis compute error:", e);
    return errorResponse(`Failed to compute analysis: ${msg}`, "SERVER_ERROR", 500);
  }
}

export async function handleSignal(symbol: string, env: Env): Promise<Response> {
  try {
    const [rsiResult, macdResult] = await Promise.all([
      getOrFetch(env, `rsi:${symbol}`, TTL.DAILY_INDICATOR, () => fetchRSI(symbol, env)),
      getOrFetch(env, `macd:${symbol}`, TTL.DAILY_INDICATOR, () => fetchMACD(symbol, env))
    ]);
    const signal = generateSignal(rsiResult.data, macdResult.data);
    return jsonResponse({ ok: true, data: { signal, rsi: rsiResult.data, macd: macdResult.data, staleness: "fresh" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return errorResponse(`Failed to compute signal: ${msg}`, "SERVER_ERROR", 500);
  }
}

export async function handleSearch(query: string, env: Env): Promise<Response> {
  try {
    const { data } = await getOrFetch(env, `search:${query.toLowerCase()}`, TTL.SEARCH, () => searchSymbols(query, env));
    return jsonResponse({ ok: true, data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return errorResponse(`Search failed: ${msg}`, "SERVER_ERROR", 500);
  }
}
