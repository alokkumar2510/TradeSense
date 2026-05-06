import type { Env } from "../types";
import { fetchQuote, fetchHistory, searchSymbols } from "../services/fmp";
import { fetchRSI, fetchMACD } from "../services/alphaVantage";
import { generateSignal } from "../services/signalEngine";
import { getOrFetch, TTL } from "../lib/cache";
import { jsonResponse, errorResponse } from "../lib/response";

export async function handleQuote(
  symbol: string,
  env: Env
): Promise<Response> {
  try {
    const { data: quote } = await getOrFetch(
      env,
      `quote:${symbol}`,
      TTL.QUOTE,
      () => fetchQuote(symbol, env)
    );
    return jsonResponse({ ok: true, data: quote });
  } catch (e: unknown) {
    console.error("Quote fetch error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "SYMBOL_NOT_FOUND") return errorResponse("Symbol not found", "NOT_FOUND", 404);
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited, cached data unavailable", "RATE_LIMITED", 429);
    return errorResponse("Failed to fetch quote", "SERVER_ERROR", 500);
  }
}

export async function handleHistory(symbol: string, env: Env): Promise<Response> {
  try {
    const { data: bars } = await getOrFetch(
      env,
      `history:${symbol}`,
      TTL.HISTORY,
      () => fetchHistory(symbol, env, 180)
    );
    return jsonResponse({ ok: true, data: bars });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited", "RATE_LIMITED", 429);
    return errorResponse("Failed to fetch history", "SERVER_ERROR", 500);
  }
}

export async function handleSignal(symbol: string, env: Env): Promise<Response> {
  try {
    // ─── Parallel fetch from both APIs ───────────────────────────────────────
    const [rsiResult, macdResult] = await Promise.allSettled([
      getOrFetch(env, `rsi:${symbol}`, TTL.INDICATORS, () => fetchRSI(symbol, env)),
      getOrFetch(env, `macd:${symbol}`, TTL.INDICATORS, () => fetchMACD(symbol, env)),
    ]);

    const rsi  = rsiResult.status  === "fulfilled" ? rsiResult.value.data  : null;
    const macd = macdResult.status === "fulfilled" ? macdResult.value.data : null;
    const staleness = (rsiResult.status === "rejected" || macdResult.status === "rejected")
      ? "stale"
      : "fresh";

    const signal = generateSignal(rsi, macd);
    return jsonResponse({ ok: true, data: { signal, rsi, macd, staleness } });
  } catch {
    return errorResponse("Failed to compute signal", "SERVER_ERROR", 500);
  }
}

export async function handleSearch(query: string, env: Env): Promise<Response> {
  try {
    const { data } = await getOrFetch(
      env,
      `search:${query.toLowerCase()}`,
      TTL.SEARCH,
      () => searchSymbols(query, env)
    );
    return jsonResponse({ ok: true, data });
  } catch {
    return errorResponse("Search failed", "SERVER_ERROR", 500);
  }
}
