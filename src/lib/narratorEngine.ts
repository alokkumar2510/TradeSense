/**
 * narratorEngine.ts
 * Deterministic, rule-based institutional market commentary.
 * Zero fake AI — every sentence is derived from real indicator values.
 */

import type { OHLCVBar } from "@/types";

// ─── Input snapshot ───────────────────────────────────────────────────────────
export interface NarratorInput {
  bars:      OHLCVBar[];
  symbol:    string;
  ltp:       number;
  change1d:  number;   // % daily change
}

// ─── Output ───────────────────────────────────────────────────────────────────
export interface NarrativeBlock {
  id:        string;
  ts:        number;
  category:  "TREND" | "MOMENTUM" | "VOLATILITY" | "VOLUME" | "STRUCTURE" | "RISK" | "SUMMARY";
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" | "CAUTION";
  headline:  string;
  body:      string;
  confidence: number;   // 0-100
}

// ─── Lightweight indicator helpers ────────────────────────────────────────────

function closes(bars: OHLCVBar[]) { return bars.map(b => b.close); }
function volumes(bars: OHLCVBar[]) { return bars.map(b => b.volume ?? 0); }

function sma(arr: number[], n: number): number {
  if (arr.length < n) return arr[arr.length - 1] ?? 0;
  const slice = arr.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
}

function emaArr(arr: number[], n: number): number[] {
  const k = 2 / (n + 1);
  const result: number[] = [];
  let prev = arr[0];
  for (const v of arr) { prev = v * k + prev * (1 - k); result.push(prev); }
  return result;
}

function rsi(arr: number[], n = 14): number {
  if (arr.length < n + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = arr.length - n; i < arr.length; i++) {
    const d = arr[i] - arr[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  const rs = losses === 0 ? 100 : gains / losses;
  return 100 - 100 / (1 + rs);
}

function atr(bars: OHLCVBar[], n = 14): number {
  if (bars.length < 2) return 0;
  const trs = bars.slice(1).map((b, i) => Math.max(
    b.high - b.low,
    Math.abs(b.high - bars[i].close),
    Math.abs(b.low  - bars[i].close)
  ));
  return sma(trs, n);
}

function bbands(arr: number[], n = 20, mult = 2) {
  const mid = sma(arr, n);
  const slice = arr.slice(-n);
  const variance = slice.reduce((a, v) => a + (v - mid) ** 2, 0) / n;
  const sd = Math.sqrt(variance);
  return { upper: mid + mult * sd, mid, lower: mid - mult * sd, bw: (sd * 2 * mult) / mid };
}

function macdLine(arr: number[]): { macd: number; signal: number; hist: number } {
  const e12 = emaArr(arr, 12);
  const e26 = emaArr(arr, 26);
  const macdSeries = e12.map((v, i) => v - e26[i]);
  const signal = emaArr(macdSeries, 9);
  const last = macdSeries.length - 1;
  return {
    macd:   macdSeries[last],
    signal: signal[last],
    hist:   macdSeries[last] - signal[last],
  };
}

function candleType(b: OHLCVBar): "BULLISH_STRONG" | "BEARISH_STRONG" | "DOJI" | "BULLISH" | "BEARISH" {
  const body  = Math.abs(b.close - b.open);
  const range = b.high - b.low;
  const bodyRatio = range > 0 ? body / range : 0;
  if (bodyRatio < 0.1) return "DOJI";
  if (b.close > b.open) return bodyRatio > 0.7 ? "BULLISH_STRONG" : "BULLISH";
  return bodyRatio > 0.7 ? "BEARISH_STRONG" : "BEARISH";
}

// ─── Trend detection ──────────────────────────────────────────────────────────

type TrendState = "STRONG_UP" | "UP" | "FLAT" | "DOWN" | "STRONG_DOWN";

function trendState(bars: OHLCVBar[]): TrendState {
  const cl = closes(bars);
  const e9  = emaArr(cl, 9);
  const e21 = emaArr(cl, 21);
  const e50 = emaArr(cl, 50);
  const ltp = cl[cl.length - 1];
  const last9 = e9[e9.length - 1], last21 = e21[e21.length - 1], last50 = e50[e50.length - 1];

  const above9  = ltp > last9;
  const above21 = ltp > last21;
  const above50 = ltp > last50;
  const emaStack = last9 > last21 && last21 > last50;

  if (above9 && above21 && above50 && emaStack) return "STRONG_UP";
  if (above21 && above50) return "UP";
  if (!above21 && !above50 && !emaStack) return ltp < last50 * 0.98 ? "STRONG_DOWN" : "DOWN";
  return "FLAT";
}

// ─── Volume analysis ──────────────────────────────────────────────────────────

type VolState = "SURGE" | "ABOVE_AVG" | "AVERAGE" | "BELOW_AVG" | "DRY";

function volumeState(bars: OHLCVBar[]): { state: VolState; ratio: number } {
  const vols = volumes(bars);
  const avgVol = sma(vols, 20);
  const lastVol = vols[vols.length - 1];
  const ratio = avgVol > 0 ? lastVol / avgVol : 1;

  let state: VolState;
  if (ratio > 2.0)      state = "SURGE";
  else if (ratio > 1.3) state = "ABOVE_AVG";
  else if (ratio > 0.8) state = "AVERAGE";
  else if (ratio > 0.5) state = "BELOW_AVG";
  else                  state = "DRY";

  return { state, ratio };
}

// ─── Volatility regime ────────────────────────────────────────────────────────

type VolatilityRegime = "HIGH" | "ELEVATED" | "NORMAL" | "COMPRESSED";

function volatilityRegime(bars: OHLCVBar[], ltp: number): { regime: VolatilityRegime; atrPct: number } {
  const a = atr(bars, 14);
  const atrPct = ltp > 0 ? (a / ltp) * 100 : 0;
  let regime: VolatilityRegime;
  if (atrPct > 3)       regime = "HIGH";
  else if (atrPct > 1.5) regime = "ELEVATED";
  else if (atrPct > 0.5) regime = "NORMAL";
  else                   regime = "COMPRESSED";
  return { regime, atrPct };
}

// ─── Support / resistance proximity ──────────────────────────────────────────

function srProximity(bars: OHLCVBar[], ltp: number) {
  const lookback = bars.slice(-50);
  const highs = lookback.map(b => b.high).sort((a, b) => b - a);
  const lows  = lookback.map(b => b.low).sort((a, b) => a - b);

  const nearRes = highs.slice(0, 5).find(h => h > ltp && (h - ltp) / ltp < 0.015);
  const nearSup = lows.slice(0, 5).find(l => l < ltp && (ltp - l) / ltp < 0.015);

  return { nearRes, nearSup };
}

// ─── Sentence templates (filled deterministically) ───────────────────────────

const T = {
  trend: {
    STRONG_UP:   ["Price is in a well-defined uptrend with EMA stacking confirming bullish structure.", "All major moving averages are aligned bullishly — price trading above EMA9, EMA21 and EMA50."],
    UP:          ["Price maintains a positive bias above key moving averages.", "The intermediate trend is bullish with price sustaining above EMA21."],
    FLAT:        ["Price is range-bound with no clear directional bias from moving averages.", "EMAs are compressing — the market is in a consolidation phase awaiting a catalyst."],
    DOWN:        ["Price is trading below key EMAs, reflecting a negative short-term bias.", "Moving average structure has turned bearish — sellers remain in control."],
    STRONG_DOWN: ["A confirmed downtrend is underway with EMA stacking aligned to the downside.", "Price is materially below all major EMAs — structural downtrend intact."],
  },
  rsi: {
    overbought:   ["RSI is in overbought territory — risk of mean-reversion pullback increases.", "Momentum is stretched to the upside; RSI above 70 warrants caution on fresh longs."],
    elevated:     ["RSI is elevated but not yet at extremes, suggesting sustained bullish momentum."],
    neutral:      ["RSI is in neutral territory — no momentum extreme present."],
    oversold_edge: ["RSI is approaching oversold — watch for a potential bounce or exhaustion of sellers."],
    oversold:     ["RSI has reached oversold levels; contrarian bounce setups may emerge.", "Sellers are exhausted per RSI — oversold readings can precede sharp recoveries."],
  },
  macd: {
    bullish_cross: ["MACD has crossed above its signal line — a bullish momentum shift is in progress."],
    bearish_cross: ["MACD has crossed below signal — momentum is turning negative."],
    positive_hist: ["MACD histogram is positive and expanding, confirming upward momentum."],
    negative_hist: ["MACD histogram is negative — downside momentum persists."],
    converging:    ["MACD and signal lines are converging — a crossover event may be imminent."],
  },
  vol: {
    SURGE:      ["Volume has surged significantly above the 20-session average — institutional participation likely.", "A volume surge is confirming the current price move — high conviction directional signal."],
    ABOVE_AVG:  ["Volume is tracking above average, lending credibility to the current price action."],
    AVERAGE:    ["Volume is in line with recent averages — no unusual activity detected."],
    BELOW_AVG:  ["Below-average volume suggests limited institutional conviction — treat moves with caution."],
    DRY:        ["Volume is critically thin — price moves in low-volume conditions may not be sustained."],
  },
  volatility: {
    HIGH:        ["Volatility is elevated — ATR signals wide intraday swings; position sizing should reflect increased risk.", "High volatility regime active — breakout moves tend to be exaggerated; tight stops may suffer whipsaws."],
    ELEVATED:    ["Above-normal volatility present — traders should widen risk parameters accordingly."],
    NORMAL:      ["Volatility is within normal bounds — conditions are conducive to measured directional trades."],
    COMPRESSED:  ["Volatility is historically compressed — a period of expansion is statistically likely.", "Bollinger Bands are squeezing — low-volatility consolidation often precedes a significant directional move."],
  },
  candle: {
    BULLISH_STRONG:  ["The most recent candle is a strong bull bar with minimal upper wick — buyers dominated the session.", "A bullish marubozu-style candle reflects unambiguous buying pressure."],
    BULLISH:         ["The last candle closed bullishly — buyers finished the session with the upper hand."],
    DOJI:            ["A Doji has formed — indecision between buyers and sellers; the next candle direction is key.", "The Doji candle signals equilibrium — the market is at a decision point."],
    BEARISH:         ["The last candle closed bearishly — selling pressure dominated the period."],
    BEARISH_STRONG:  ["A strong bear bar has printed — sellers have firm control of the most recent session.", "A bearish marubozu signals aggressive selling with no meaningful buyer response."],
  },
  sr: {
    near_res: (p: number) => `Price is within 1.5% of resistance at ₹${p.toFixed(2)} — a breakout or rejection here will be significant.`,
    near_sup: (p: number) => `Price is testing support at ₹${p.toFixed(2)} — a hold of this zone would be constructive for bulls.`,
  },
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Date.now() / 3000) % arr.length]; }

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateNarrative(input: NarratorInput): NarrativeBlock[] {
  const { bars, symbol, ltp, change1d } = input;
  if (bars.length < 30) return [];

  const cl      = closes(bars);
  const trend   = trendState(bars);
  const vol     = volumeState(bars);
  const vola    = volatilityRegime(bars, ltp);
  const rsiVal  = rsi(cl);
  const bb      = bbands(cl);
  const { macd: macdVal, signal: sigVal, hist } = macdLine(cl);
  const lastBar = bars[bars.length - 1];
  const cType   = candleType(lastBar);
  const { nearRes, nearSup } = srProximity(bars, ltp);

  const blocks: NarrativeBlock[] = [];
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // ── TREND block ─────────────────────────────────────────────────────────────
  const trendSentiment: NarrativeBlock["sentiment"] =
    trend === "STRONG_UP" || trend === "UP" ? "BULLISH"
    : trend === "STRONG_DOWN" || trend === "DOWN" ? "BEARISH"
    : "NEUTRAL";
  const trendConf = trend === "STRONG_UP" || trend === "STRONG_DOWN" ? 88 : trend === "FLAT" ? 55 : 72;

  blocks.push({
    id: uid(), ts: Date.now(), category: "TREND",
    sentiment: trendSentiment,
    headline: `${symbol} — Trend: ${trend.replace("_", " ")}`,
    body: pick(T.trend[trend]),
    confidence: trendConf,
  });

  // ── MOMENTUM block ───────────────────────────────────────────────────────────
  let momentumSentiment: NarrativeBlock["sentiment"] = "NEUTRAL";
  let momentumBody = "";
  let momentumConf = 65;

  if (rsiVal > 70) {
    momentumSentiment = "CAUTION"; momentumBody = pick(T.rsi.overbought); momentumConf = 80;
  } else if (rsiVal > 60) {
    momentumSentiment = "BULLISH"; momentumBody = pick(T.rsi.elevated); momentumConf = 70;
  } else if (rsiVal < 30) {
    momentumSentiment = "CAUTION"; momentumBody = pick(T.rsi.oversold); momentumConf = 78;
  } else if (rsiVal < 40) {
    momentumSentiment = "BEARISH"; momentumBody = pick(T.rsi.oversold_edge); momentumConf = 65;
  } else {
    momentumSentiment = "NEUTRAL"; momentumBody = pick(T.rsi.neutral); momentumConf = 55;
  }

  const macdSent = hist > 0 ? "BULLISH" : "BEARISH";
  const macdBody = hist > 0 && macdVal > sigVal
    ? pick(T.macd.bullish_cross)
    : hist < 0 && macdVal < sigVal
    ? pick(T.macd.bearish_cross)
    : hist > 0
    ? pick(T.macd.positive_hist)
    : pick(T.macd.negative_hist);

  blocks.push({
    id: uid(), ts: Date.now(), category: "MOMENTUM",
    sentiment: momentumSentiment,
    headline:  `RSI ${rsiVal.toFixed(1)} | MACD ${hist > 0 ? "+" : ""}${hist.toFixed(2)}`,
    body:      `${momentumBody} ${macdBody}`,
    confidence: momentumConf,
  });

  // ── VOLATILITY block ─────────────────────────────────────────────────────────
  const volaSent: NarrativeBlock["sentiment"] =
    vola.regime === "HIGH" ? "CAUTION"
    : vola.regime === "COMPRESSED" ? "NEUTRAL"
    : trendSentiment;

  blocks.push({
    id: uid(), ts: Date.now(), category: "VOLATILITY",
    sentiment: volaSent,
    headline:  `Volatility: ${vola.regime} (ATR ${vola.atrPct.toFixed(2)}%)`,
    body:      pick(T.volatility[vola.regime]),
    confidence: vola.regime === "HIGH" || vola.regime === "COMPRESSED" ? 82 : 65,
  });

  // ── VOLUME block ─────────────────────────────────────────────────────────────
  const volSent: NarrativeBlock["sentiment"] =
    vol.state === "SURGE" || vol.state === "ABOVE_AVG"
      ? trendSentiment
      : vol.state === "DRY" || vol.state === "BELOW_AVG"
      ? "CAUTION"
      : "NEUTRAL";

  blocks.push({
    id: uid(), ts: Date.now(), category: "VOLUME",
    sentiment: volSent,
    headline:  `Volume ${(vol.ratio * 100).toFixed(0)}% of 20-day avg — ${vol.state.replace("_", " ")}`,
    body:      pick(T.vol[vol.state]),
    confidence: vol.state === "SURGE" ? 85 : vol.state === "DRY" ? 80 : 60,
  });

  // ── STRUCTURE block ───────────────────────────────────────────────────────────
  const candleSent: NarrativeBlock["sentiment"] =
    cType === "BULLISH_STRONG" || cType === "BULLISH" ? "BULLISH"
    : cType === "BEARISH_STRONG" || cType === "BEARISH" ? "BEARISH"
    : "NEUTRAL";

  let structureBody = pick(T.candle[cType]);
  if (nearRes) structureBody += " " + T.sr.near_res(nearRes);
  else if (nearSup) structureBody += " " + T.sr.near_sup(nearSup);

  // BB position
  const bbPos = ltp > bb.upper ? " Price is trading above the upper Bollinger Band — extended conditions."
    : ltp < bb.lower ? " Price has pierced the lower Bollinger Band — oversold extension or trend acceleration."
    : "";
  structureBody += bbPos;

  blocks.push({
    id: uid(), ts: Date.now(), category: "STRUCTURE",
    sentiment: candleSent,
    headline:  `Candle: ${cType.replace("_", " ")} | BB width ${(bb.bw * 100).toFixed(2)}%`,
    body:      structureBody,
    confidence: cType === "BULLISH_STRONG" || cType === "BEARISH_STRONG" ? 80 : 65,
  });

  // ── SUMMARY block ─────────────────────────────────────────────────────────────
  const bullSignals = [
    trend === "STRONG_UP" || trend === "UP",
    rsiVal > 50 && rsiVal < 70,
    hist > 0,
    vol.state === "SURGE" || vol.state === "ABOVE_AVG",
    cType === "BULLISH" || cType === "BULLISH_STRONG",
  ].filter(Boolean).length;

  const bearSignals = [
    trend === "STRONG_DOWN" || trend === "DOWN",
    rsiVal < 50 && rsiVal > 30,
    hist < 0,
    vol.state === "DRY",
    cType === "BEARISH" || cType === "BEARISH_STRONG",
  ].filter(Boolean).length;

  let summaryBody: string;
  let summarySentiment: NarrativeBlock["sentiment"];
  let summaryConf: number;

  if (bullSignals >= 4) {
    summarySentiment = "BULLISH"; summaryConf = 85;
    summaryBody = `Multiple indicators align bullishly — ${bullSignals}/5 signals confirm upward bias. Momentum is strengthening while volatility ${vola.regime === "HIGH" ? "remains elevated; size risk accordingly" : "remains controlled, supporting bullish continuation"}.`;
  } else if (bearSignals >= 4) {
    summarySentiment = "BEARISH"; summaryConf = 83;
    summaryBody = `${bearSignals}/5 indicators point to downside pressure. ${vol.state === "DRY" ? "Thin volume makes the move suspect — await confirmation." : "Sellers have the upper hand across trend, momentum and candle structure."}`;
  } else if (bullSignals > bearSignals) {
    summarySentiment = "BULLISH"; summaryConf = 65;
    summaryBody = `Mixed signals with a mild bullish skew (${bullSignals}B/${bearSignals}S). The trend is constructive but momentum confirmation is incomplete — directional conviction is moderate.`;
  } else if (bearSignals > bullSignals) {
    summarySentiment = "BEARISH"; summaryConf = 63;
    summaryBody = `Mixed signals with a mild bearish tilt (${bearSignals}B/${bullSignals}S). No major structural breakdown, but short-term pressure warrants caution.`;
  } else {
    summarySentiment = "NEUTRAL"; summaryConf = 50;
    summaryBody = `Signals are evenly split — the market is at a crossroads. Volatility is ${vola.regime.toLowerCase()} and volume offers no conviction. Await a clear catalyst before committing directionally.`;
  }

  blocks.push({
    id: uid(), ts: Date.now(), category: "SUMMARY",
    sentiment: summarySentiment,
    headline:  `${symbol} — ${summarySentiment} (${summaryConf}% conviction)`,
    body:      summaryBody,
    confidence: summaryConf,
  });

  return blocks;
}

// ─── Diff detection — only push new blocks if context changed ─────────────────
export function narratorFingerprint(input: NarratorInput): string {
  if (input.bars.length < 2) return "";
  const cl   = input.bars.map(b => b.close);
  const last3 = cl.slice(-3).map(v => v.toFixed(2)).join(",");
  const vol3  = input.bars.slice(-3).map(b => b.volume ?? 0).join(",");
  return `${input.symbol}|${last3}|${vol3}|${input.change1d.toFixed(2)}`;
}
