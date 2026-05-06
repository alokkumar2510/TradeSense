import type { Env } from "../types";

const BASE = "https://www.alphavantage.co/query";

interface AVRSIDataPoint { "RSI": string; }
interface AVMACDDataPoint {
  "MACD":       string;
  "MACD_Signal": string;
  "MACD_Hist":  string;
}

export interface RSIResult {
  value:     number;
  timestamp: string;
}

export interface MACDResult {
  macd:      number;
  signal:    number;
  histogram: number;
  timestamp: string;
}

export async function fetchRSI(symbol: string, env: Env): Promise<RSIResult> {
  const url =
    `${BASE}?function=RSI&symbol=${encodeURIComponent(symbol)}` +
    `&interval=daily&time_period=14&series_type=close&apikey=${env.ALPHA_VANTAGE_KEY}`;

  const res = await fetch(url);
  if (res.status === 429) throw new Error("AV_RATE_LIMITED");
  if (!res.ok)            throw new Error(`AV RSI error: ${res.status}`);

  const json = await res.json<Record<string, unknown>>();

  // Alpha Vantage wraps data under a dynamic key
  const dataKey = Object.keys(json).find((k) => k.startsWith("Technical Analysis"));
  if (!dataKey) {
    // Rate limit or invalid symbol — AV returns a Note field
    if (json["Note"] || json["Information"])  throw new Error("AV_RATE_LIMITED");
    throw new Error("AV_RSI_PARSE_ERROR");
  }

  const timeSeries = json[dataKey] as Record<string, AVRSIDataPoint>;
  const latestDate = Object.keys(timeSeries)[0];
  return {
    value:     parseFloat(timeSeries[latestDate]["RSI"]),
    timestamp: latestDate,
  };
}

export async function fetchMACD(symbol: string, env: Env): Promise<MACDResult> {
  const url =
    `${BASE}?function=MACD&symbol=${encodeURIComponent(symbol)}` +
    `&interval=daily&series_type=close&apikey=${env.ALPHA_VANTAGE_KEY}`;

  const res = await fetch(url);
  if (res.status === 429) throw new Error("AV_RATE_LIMITED");
  if (!res.ok)            throw new Error(`AV MACD error: ${res.status}`);

  const json = await res.json<Record<string, unknown>>();
  const dataKey = Object.keys(json).find((k) => k.startsWith("Technical Analysis"));
  if (!dataKey) {
    if (json["Note"] || json["Information"]) throw new Error("AV_RATE_LIMITED");
    throw new Error("AV_MACD_PARSE_ERROR");
  }

  const timeSeries = json[dataKey] as Record<string, AVMACDDataPoint>;
  const latestDate = Object.keys(timeSeries)[0];
  const latest     = timeSeries[latestDate];
  return {
    macd:      parseFloat(latest["MACD"]),
    signal:    parseFloat(latest["MACD_Signal"]),
    histogram: parseFloat(latest["MACD_Hist"]),
    timestamp: latestDate,
  };
}
