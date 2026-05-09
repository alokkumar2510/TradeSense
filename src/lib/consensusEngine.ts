import type { OHLCVBar } from "@/types";
import { ema, rsiSeries, macdSeries, bollingerBands, momentumSeries } from "./chartIndicators";
import type { UTCTimestamp } from "lightweight-charts";

/* ── Types ─────────────────────────────────────────────────────── */
export type SignalLabel = "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
export type TFKey = "5m" | "15m" | "1H" | "4H" | "1D";

export interface TFSignal {
  tf: TFKey;
  signal: SignalLabel;
  score: number;        // -100 to +100
  rsi: number;
  macdBias: "bull" | "bear" | "neutral";
  emaBias: "bull" | "bear" | "neutral";
  bbPos: number;        // 0-1: 0=at lower band, 1=at upper
  atr: number;
  momentum: number;
  volBias: "high" | "normal" | "low";
}

export interface ConsensusOutput {
  signal: SignalLabel;
  score: number;
  confidence: number;   // 0-100
  trendStrength: number; // 0-100
  momentumRating: number; // -100 to +100
  volatilityState: "low" | "normal" | "elevated" | "extreme";
  timeframes: TFSignal[];
  factors: { name: string; value: string; bias: "bull" | "bear" | "neutral"; weight: number }[];
  timestamp: number;
}

/* ── ATR ────────────────────────────────────────────────────────── */
function atr(bars: OHLCVBar[], period = 14): number {
  if (bars.length < period + 1) return 0;
  const trs = bars.slice(1).map((b, i) =>
    Math.max(b.high - b.low, Math.abs(b.high - bars[i].close), Math.abs(b.low - bars[i].close))
  );
  return trs.slice(-period).reduce((a, v) => a + v, 0) / period;
}

/* ── Volume bias ────────────────────────────────────────────────── */
function volBias(bars: OHLCVBar[]): "high" | "normal" | "low" {
  if (bars.length < 20) return "normal";
  const avg = bars.slice(-20).reduce((a, b) => a + b.volume, 0) / 20;
  const last = bars[bars.length - 1].volume;
  if (last > avg * 1.5) return "high";
  if (last < avg * 0.6) return "low";
  return "normal";
}

/* ── Analyse one timeframe's bars ───────────────────────────────── */
function analyseTimeframe(bars: OHLCVBar[], tf: TFKey): TFSignal {
  if (bars.length < 35) {
    return { tf, signal: "NEUTRAL", score: 0, rsi: 50, macdBias: "neutral", emaBias: "neutral", bbPos: 0.5, atr: 0, momentum: 0, volBias: "normal" };
  }

  let score = 0;

  /* RSI (weight: 25) */
  const rsiArr = rsiSeries(bars);
  const rsiVal = rsiArr.length ? rsiArr[rsiArr.length - 1].value : 50;
  if (rsiVal < 30) score += 25;
  else if (rsiVal < 45) score += 12;
  else if (rsiVal > 70) score -= 25;
  else if (rsiVal > 55) score -= 12;

  /* MACD (weight: 25) */
  const { macd: md, sig } = macdSeries(bars);
  const macdVal = md.length ? md[md.length - 1].value : 0;
  const sigVal  = sig.length ? sig[sig.length - 1].value : 0;
  const macdBias: "bull" | "bear" | "neutral" = macdVal > sigVal ? "bull" : macdVal < sigVal ? "bear" : "neutral";
  const macdCross = md.length > 1 && sig.length > 1
    ? (md[md.length - 2].value <= sig[sig.length - 2].value && macdVal > sigVal ? 15
       : md[md.length - 2].value >= sig[sig.length - 2].value && macdVal < sigVal ? -15 : 0)
    : 0;
  score += macdBias === "bull" ? 15 : macdBias === "bear" ? -15 : 0;
  score += macdCross;

  /* EMA structure (weight: 25) */
  const e9  = ema(bars, 9);
  const e21 = ema(bars, 21);
  const e50 = ema(bars, 50);
  const e9v  = e9.length  ? e9[e9.length - 1].value   : 0;
  const e21v = e21.length ? e21[e21.length - 1].value  : 0;
  const e50v = e50.length ? e50[e50.length - 1].value  : 0;
  const price = bars[bars.length - 1].close;
  const emaBull = e9v > e21v && e21v > e50v && price > e9v;
  const emaBear = e9v < e21v && e21v < e50v && price < e9v;
  const emaBias: "bull" | "bear" | "neutral" = emaBull ? "bull" : emaBear ? "bear" : "neutral";
  score += emaBull ? 20 : emaBear ? -20 : (price > e21v ? 8 : price < e21v ? -8 : 0);

  /* Bollinger position (weight: 15) */
  let bbPos = 0.5;
  if (bars.length >= 20) {
    const bb = bollingerBands(bars);
    if (bb.upper.length) {
      const upper = bb.upper[bb.upper.length - 1].value;
      const lower = bb.lower[bb.lower.length - 1].value;
      bbPos = upper === lower ? 0.5 : (price - lower) / (upper - lower);
      if (bbPos < 0.2) score += 15;
      else if (bbPos > 0.8) score -= 15;
    }
  }

  /* Momentum (weight: 10) */
  const mom = momentumSeries(bars);
  const momVal = mom.length ? mom[mom.length - 1].value : 0;
  score += Math.min(Math.max(momVal * 0.5, -10), 10);

  const atrVal  = atr(bars);
  const vb      = volBias(bars);
  if (vb === "high" && score > 0) score += 5;
  if (vb === "high" && score < 0) score -= 5;

  score = Math.min(Math.max(score, -100), 100);

  let signal: SignalLabel;
  if (score >= 55)      signal = "STRONG_BUY";
  else if (score >= 20) signal = "BUY";
  else if (score <= -55) signal = "STRONG_SELL";
  else if (score <= -20) signal = "SELL";
  else                   signal = "NEUTRAL";

  return { tf, signal, score, rsi: rsiVal, macdBias, emaBias, bbPos, atr: atrVal, momentum: momVal, volBias: vb };
}

/* ── Aggregate across timeframes ────────────────────────────────── */
const TF_WEIGHTS: Record<TFKey, number> = { "5m": 0.08, "15m": 0.12, "1H": 0.20, "4H": 0.25, "1D": 0.35 };

export function computeConsensus(barsByTF: Partial<Record<TFKey, OHLCVBar[]>>): ConsensusOutput {
  const results: TFSignal[] = [];
  let totalWeight = 0, weightedScore = 0;

  for (const [tf, bars] of Object.entries(barsByTF) as [TFKey, OHLCVBar[]][]) {
    if (!bars?.length) continue;
    const sig = analyseTimeframe(bars, tf);
    results.push(sig);
    const w = TF_WEIGHTS[tf] ?? 0.1;
    weightedScore += sig.score * w;
    totalWeight   += w;
  }

  const score = totalWeight > 0 ? weightedScore / totalWeight : 0;

  /* Confidence: agreement across TFs */
  const bullish  = results.filter(r => r.score > 15).length;
  const bearish  = results.filter(r => r.score < -15).length;
  const total    = results.length || 1;
  const agreement = Math.max(bullish, bearish) / total;
  const confidence = Math.round(50 + agreement * 50);

  /* Trend strength: average abs score weighted by TF importance */
  const trendStrength = Math.round(
    results.reduce((a, r) => a + Math.abs(r.score) * (TF_WEIGHTS[r.tf] ?? 0.1), 0) /
    (totalWeight || 1)
  );

  /* Momentum rating: average momentum across TFs */
  const momentumRating = results.length
    ? Math.round(results.reduce((a, r) => a + r.momentum, 0) / results.length * 2)
    : 0;

  /* Volatility state from daily ATR % */
  const dailySig = results.find(r => r.tf === "1D");
  const dailyBars = barsByTF["1D"] ?? [];
  const lastPrice = dailyBars.length ? dailyBars[dailyBars.length - 1].close : 1;
  const atrPct    = dailySig ? (dailySig.atr / lastPrice) * 100 : 0;
  const volatilityState: ConsensusOutput["volatilityState"] =
    atrPct > 5 ? "extreme" : atrPct > 3 ? "elevated" : atrPct > 1.5 ? "normal" : "low";

  let signal: SignalLabel;
  if (score >= 50)       signal = "STRONG_BUY";
  else if (score >= 18)  signal = "BUY";
  else if (score <= -50) signal = "STRONG_SELL";
  else if (score <= -18) signal = "SELL";
  else                   signal = "NEUTRAL";

  /* Factor breakdown */
  const latest = results[results.length - 1];
  const factors: ConsensusOutput["factors"] = latest ? [
    { name: "RSI",          value: latest.rsi.toFixed(1),          bias: latest.rsi < 40 ? "bull" : latest.rsi > 60 ? "bear" : "neutral", weight: 25 },
    { name: "MACD",         value: latest.macdBias.toUpperCase(),  bias: latest.macdBias, weight: 25 },
    { name: "EMA Structure", value: latest.emaBias.toUpperCase(),  bias: latest.emaBias,  weight: 25 },
    { name: "BB Position",  value: (latest.bbPos * 100).toFixed(0) + "%", bias: latest.bbPos < 0.3 ? "bull" : latest.bbPos > 0.7 ? "bear" : "neutral", weight: 15 },
    { name: "Volume",       value: latest.volBias.toUpperCase(),   bias: latest.volBias === "high" && score > 0 ? "bull" : latest.volBias === "high" && score < 0 ? "bear" : "neutral", weight: 10 },
  ] : [];

  return {
    signal, score: Math.round(score), confidence, trendStrength,
    momentumRating: Math.min(Math.max(momentumRating, -100), 100),
    volatilityState, timeframes: results, factors, timestamp: Date.now(),
  };
}

/* ── Simulate multi-TF bars from a single 1D series ─────────────── */
export function simulateTFBars(daily: OHLCVBar[]): Partial<Record<TFKey, OHLCVBar[]>> {
  if (!daily.length) return {};
  // For intraday TFs we synthesise from daily by slicing different windows
  // Real impl would fetch each TF from API; this provides an offline fallback
  const aggr = (n: number): OHLCVBar[] => {
    const out: OHLCVBar[] = [];
    for (let i = 0; i + n <= daily.length; i += n) {
      const chunk = daily.slice(i, i + n);
      out.push({
        time:   chunk[chunk.length - 1].time,
        open:   chunk[0].open,
        high:   Math.max(...chunk.map(b => b.high)),
        low:    Math.min(...chunk.map(b => b.low)),
        close:  chunk[chunk.length - 1].close,
        volume: chunk.reduce((a, b) => a + b.volume, 0),
      });
    }
    return out;
  };
  return {
    "5m":  aggr(1).slice(-60),
    "15m": aggr(1).slice(-80),
    "1H":  aggr(2).slice(-90),
    "4H":  aggr(4),
    "1D":  daily,
  };
}
