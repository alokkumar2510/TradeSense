/**
 * analyticsEngine.ts
 * ──────────────────
 * All intelligence engines computed from raw OHLCV bars.
 * Zero external data. No random values. All deterministic.
 */

import type { OHLCVBar } from "@/types";
import type {
  ConsensusResult, MomentumResult, InstitutionalResult,
  RiskResult, EmotionResult, AnalysisResult,
} from "@/types";

// ─── Primitives ───────────────────────────────────────────────────────────────

function ema(vals: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let e = vals[0];
  for (let i = 0; i < vals.length; i++) {
    e = i === 0 ? vals[i] : vals[i] * k + e * (1 - k);
    out.push(e);
  }
  return out;
}

function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let avgG = 0, avgL = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    d > 0 ? (avgG += d) : (avgL -= d);
  }
  avgG /= period; avgL /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgG = (avgG * (period - 1) + Math.max(d, 0)) / period;
    avgL = (avgL * (period - 1) + Math.max(-d, 0)) / period;
  }
  return avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
}

function atr(bars: OHLCVBar[], period = 14): number {
  if (bars.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    trs.push(Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low  - bars[i - 1].close),
    ));
  }
  return trs.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, trs.length);
}

function macd(closes: number[]) {
  if (closes.length < 35) return { macd: 0, signal: 0, histogram: 0 };
  const e12  = ema(closes, 12);
  const e26  = ema(closes, 26);
  const diff = e12.map((v, i) => v - e26[i]);
  const sig  = ema(diff, 9);
  const m    = diff[diff.length - 1];
  const s    = sig[sig.length - 1];
  return { macd: m, signal: s, histogram: m - s };
}

function bollingerPosition(closes: number[], period = 20, mult = 2): number {
  // Returns 0–1 where 0=lower band, 0.5=mid, 1=upper band
  if (closes.length < period) return 0.5;
  const sl   = closes.slice(-period);
  const mean = sl.reduce((a, b) => a + b, 0) / period;
  const std  = Math.sqrt(sl.reduce((a, v) => a + (v - mean) ** 2, 0) / period);
  if (std === 0) return 0.5;
  const upper = mean + mult * std;
  const lower = mean - mult * std;
  return Math.min(1, Math.max(0, (closes[closes.length - 1] - lower) / (upper - lower)));
}

function volumeRatio(bars: OHLCVBar[], period = 20): number {
  if (bars.length < 2) return 1;
  const slice = bars.slice(-period - 1, -1);
  if (!slice.length) return 1;
  const avg = slice.reduce((a, b) => a + b.volume, 0) / slice.length;
  return avg === 0 ? 1 : bars[bars.length - 1].volume / avg;
}

function bodyDominance(bars: OHLCVBar[], n = 10): number {
  // Avg ratio of candle body to total range
  const slice = bars.slice(-n);
  const ratios = slice.map(b => {
    const range = b.high - b.low;
    return range === 0 ? 0 : Math.abs(b.close - b.open) / range;
  });
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

function momentumAcceleration(closes: number[], n = 10): number {
  // Second derivative of price — how fast momentum is changing
  if (closes.length < n + 3) return 0;
  const sl  = closes.slice(-n);
  const rets: number[] = [];
  for (let i = 1; i < sl.length; i++) rets.push((sl[i] - sl[i - 1]) / sl[i - 1]);
  const mid   = Math.floor(rets.length / 2);
  const first = rets.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const last  = rets.slice(mid).reduce((a, b) => a + b, 0) / (rets.length - mid);
  return last - first; // positive = accelerating up, negative = decelerating
}

function peakDrawdown(closes: number[], n = 60): number {
  // Max drawdown from peak over last n bars
  const sl = closes.slice(-n);
  let peak = sl[0], maxDD = 0;
  for (const c of sl) {
    if (c > peak) peak = c;
    maxDD = Math.max(maxDD, (peak - c) / peak);
  }
  return maxDD;
}

function trendConsistency(closes: number[], n = 20): number {
  // What fraction of bars move in the direction of the overall trend
  if (closes.length < n + 1) return 0.5;
  const sl   = closes.slice(-n - 1);
  const dir  = sl[sl.length - 1] > sl[0] ? 1 : -1;
  let count  = 0;
  for (let i = 1; i < sl.length; i++) if ((sl[i] - sl[i - 1]) * dir > 0) count++;
  return count / n;
}

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function round1(v: number) { return Math.round(v * 10) / 10; }

// ─── Engine 1: Consensus ──────────────────────────────────────────────────────

export function computeConsensus(bars: OHLCVBar[]): ConsensusResult {
  if (bars.length < 30) {
    return { signal:"HOLD", label:"Insufficient Data", score:0, buyProb:50, sellProb:50, confidence:0, factors:[] };
  }

  const closes  = bars.map(b => b.close);
  const ema9v   = ema(closes, 9);
  const ema21v  = ema(closes, 21);
  const ema50v  = ema(closes, 50);
  const e9      = ema9v[ema9v.length - 1];
  const e21     = ema21v[ema21v.length - 1];
  const e50     = ema50v.length ? ema50v[ema50v.length - 1] : 0;
  const rsiVal  = rsi(closes);
  const macdVal = macd(closes);
  const bbPos   = bollingerPosition(closes);
  const volR    = volumeRatio(bars);
  const trendC  = trendConsistency(closes);
  const price   = closes[closes.length - 1];

  // Score components: each returns –2 to +2
  const scores: { name: string; value: number; label: string; bias: "bull" | "bear" | "neutral" }[] = [];

  // EMA structure
  const emaScore = e9 > e21 && e21 > e50 ? 2 : e9 > e21 ? 1 : e9 < e21 && e21 < e50 ? -2 : -1;
  scores.push({ name: "EMA Structure", value: emaScore, label: e9 > e21 && e21 > e50 ? "Full Bull Stack" : e9 < e21 && e21 < e50 ? "Full Bear Stack" : "Mixed", bias: emaScore > 0 ? "bull" : emaScore < 0 ? "bear" : "neutral" });

  // RSI
  const rsiScore = rsiVal > 70 ? -1 : rsiVal > 55 ? 1 : rsiVal > 45 ? 0 : rsiVal > 30 ? -1 : 2;
  scores.push({ name: "RSI(14)", value: rsiScore, label: `${round1(rsiVal)} ${rsiVal > 70 ? "Overbought" : rsiVal < 30 ? "Oversold" : rsiVal > 55 ? "Bullish" : "Neutral"}`, bias: rsiScore > 0 ? "bull" : rsiScore < 0 ? "bear" : "neutral" });

  // MACD
  const macdScore = macdVal.macd > 0 && macdVal.histogram > 0 ? 2 : macdVal.macd > 0 ? 1 : macdVal.macd < 0 && macdVal.histogram < 0 ? -2 : -1;
  scores.push({ name: "MACD Signal", value: macdScore, label: macdVal.histogram > 0 ? "Bullish Cross" : "Bearish Cross", bias: macdScore > 0 ? "bull" : "bear" });

  // Bollinger position
  const bbScore = bbPos > 0.8 ? -1 : bbPos > 0.6 ? 1 : bbPos > 0.4 ? 0 : bbPos > 0.2 ? -1 : 2;
  scores.push({ name: "BB Position", value: bbScore, label: `${Math.round(bbPos * 100)}% ${bbPos > 0.75 ? "Near Upper" : bbPos < 0.25 ? "Near Lower" : "Mid Band"}`, bias: bbScore > 0 ? "bull" : bbScore < 0 ? "bear" : "neutral" });

  // Volume
  const volScore = volR > 2 ? 2 : volR > 1.3 ? 1 : volR < 0.7 ? -1 : 0;
  scores.push({ name: "Volume Activity", value: volScore, label: `${round1(volR)}× avg ${volR > 1.5 ? "— Expansion" : volR < 0.7 ? "— Dry" : "— Normal"}`, bias: volScore > 0 ? "bull" : volScore < 0 ? "bear" : "neutral" });

  // Trend consistency
  const tcScore = trendC > 0.65 ? 2 : trendC > 0.55 ? 1 : trendC < 0.4 ? -1 : 0;
  scores.push({ name: "Trend Stability", value: tcScore, label: `${Math.round(trendC * 100)}% consistent`, bias: tcScore > 0 ? "bull" : tcScore < 0 ? "bear" : "neutral" });

  // Price vs EMA50
  const pEmaScore = e50 > 0 ? (price > e50 * 1.02 ? 1 : price < e50 * 0.98 ? -1 : 0) : 0;
  scores.push({ name: "Price vs EMA50", value: pEmaScore, label: e50 > 0 ? `${((price / e50 - 1) * 100).toFixed(1)}% ${price > e50 ? "above" : "below"}` : "N/A", bias: pEmaScore > 0 ? "bull" : pEmaScore < 0 ? "bear" : "neutral" });

  const total   = scores.reduce((a, s) => a + s.value, 0);
  const maxPoss = scores.length * 2;
  const pct     = (total / maxPoss + 1) / 2; // normalise 0–1

  const buyProb  = Math.round(clamp(pct * 100, 5, 95));
  const sellProb = 100 - buyProb;
  const score    = Math.round(clamp((pct - 0.5) * 200, -100, 100));
  const confidence = Math.round(clamp(Math.abs(score) * 0.85 + trendC * 15, 10, 95));

  const signal = score >= 60 ? "STRONG_BUY" : score >= 20 ? "BUY" : score <= -60 ? "STRONG_SELL" : score <= -20 ? "SELL" : "HOLD";
  const labels: Record<string, string> = { STRONG_BUY:"Strong Buy", BUY:"Buy Signal", HOLD:"Hold / Neutral", SELL:"Sell Signal", STRONG_SELL:"Strong Sell" };

  return {
    signal, label: labels[signal], score, buyProb, sellProb, confidence,
    factors: scores.map(s => ({ name: s.name, value: s.label, bias: s.bias })),
  };
}

// ─── Engine 2: Momentum Pulse ─────────────────────────────────────────────────

export function computeMomentum(bars: OHLCVBar[]): MomentumResult {
  if (bars.length < 20) return { phase:"Insufficient Data", strength:0, acceleration:0, exhaustion:false, description:"Need more bars" };

  const closes   = bars.map(b => b.close);
  const accl     = momentumAcceleration(closes, 14);
  const body     = bodyDominance(bars, 14);
  const rsiVal   = rsi(closes);
  const volR     = volumeRatio(bars);
  const macdVal  = macd(closes);
  const trendC   = trendConsistency(closes, 14);

  // Strength: 0–100 from body dominance + trend consistency + RSI momentum
  const rsiMomentum = Math.abs(rsiVal - 50) / 50; // 0=neutral, 1=extreme
  const strength = Math.round(clamp((body * 40 + trendC * 40 + rsiMomentum * 20), 0, 100));

  // Acceleration: signed, normalised
  const acceleration = Math.round(clamp(accl * 5000, -100, 100));

  // Exhaustion signals
  const exhaustion = (rsiVal > 72 && macdVal.histogram < 0) || (rsiVal < 28 && macdVal.histogram > 0) || (body < 0.2 && volR > 1.8);

  // Phase classification
  let phase: string;
  if (exhaustion) {
    phase = rsiVal > 60 ? "Exhaustion — Bulls Fading" : "Exhaustion — Bears Fading";
  } else if (acceleration > 15 && volR > 1.2) {
    phase = "Expansion — Breakout Active";
  } else if (Math.abs(acceleration) < 8 && body < 0.35) {
    phase = "Compression — Coiling";
  } else if (acceleration < -15) {
    phase = "Reversal Risk — Momentum Waning";
  } else if (trendC > 0.6 && body > 0.5) {
    phase = "Continuation — Trend Intact";
  } else {
    phase = "Neutral — Choppy";
  }

  const description = `Body dominance ${Math.round(body * 100)}% | Vol ${round1(volR)}× | RSI ${round1(rsiVal)} | ${acceleration > 0 ? "Accelerating" : "Decelerating"}`;
  return { phase, strength, acceleration, exhaustion, description };
}

// ─── Engine 3: Institutional Detector ────────────────────────────────────────

export function computeInstitutional(bars: OHLCVBar[]): InstitutionalResult {
  if (bars.length < 20) return { detected:false, type:"No Data", confidence:0, description:"Need more bars", volumeRatio:1 };

  const closes  = bars.map(b => b.close);
  const volR    = volumeRatio(bars, 20);
  const atrVal  = atr(bars, 14);
  const price   = closes[closes.length - 1];
  const macdVal = macd(closes);
  const rsiVal  = rsi(closes);
  const bbPos   = bollingerPosition(closes);

  // ATR compression: current range vs historical
  const last5Ranges   = bars.slice(-5).map(b => b.high - b.low);
  const last20Ranges  = bars.slice(-25, -5).map(b => b.high - b.low);
  const avgRange5  = last5Ranges.reduce((a, b) => a + b, 0) / last5Ranges.length;
  const avgRange20 = last20Ranges.length ? last20Ranges.reduce((a, b) => a + b, 0) / last20Ranges.length : avgRange5;
  const rangeRatio = avgRange20 > 0 ? avgRange5 / avgRange20 : 1;

  // Volume spike detection (last bar vs 20-bar avg excluding last)
  const volSpike = volR > 2.5;
  const volHigher = volR > 1.5;

  // Candle direction of last bar
  const lastBar   = bars[bars.length - 1];
  const bullCandle = lastBar.close > lastBar.open;

  // Detect patterns
  let type = "Retail Flow";
  let confidence = 0;
  let detected = false;

  if (volSpike && bullCandle && bbPos < 0.4) {
    type = "Smart Money Entry"; confidence = Math.round(clamp(volR * 18 + 20, 30, 90)); detected = true;
  } else if (volSpike && !bullCandle && bbPos > 0.6) {
    type = "Distribution — Smart Sell"; confidence = Math.round(clamp(volR * 18 + 10, 25, 88)); detected = true;
  } else if (volHigher && rsiVal < 35 && macdVal.histogram > 0) {
    type = "Accumulation — Demand Zone"; confidence = Math.round(clamp(volR * 15 + 20, 30, 82)); detected = true;
  } else if (rangeRatio < 0.45 && atrVal > 0) {
    type = "Volatility Compression — Coil"; confidence = Math.round(clamp((1 - rangeRatio) * 70 + 10, 20, 78)); detected = true;
  } else if (volSpike && Math.abs(bbPos - 0.5) > 0.35) {
    type = "Liquidity Sweep"; confidence = Math.round(clamp(volR * 12 + 15, 20, 80)); detected = true;
  } else if (volHigher && bullCandle) {
    type = "Buying Pressure"; confidence = Math.round(clamp(volR * 12, 15, 65));
  }

  const description = detected
    ? `${type} detected. Vol ${round1(volR)}× avg. RSI ${round1(rsiVal)}. BB pos ${Math.round(bbPos * 100)}%.`
    : `No institutional signal. Vol ${round1(volR)}× avg. Normal retail activity.`;

  return { detected, type, confidence, description, volumeRatio: round1(volR) };
}

// ─── Engine 4: Risk Engine ───────────────────────────────────────────────────

export function computeRisk(bars: OHLCVBar[]): RiskResult {
  const fallback: RiskResult = { level:"Moderate", score:50, volatilityPct:2, drawdownRisk:5, stopLoss:0, targetPrice:0, riskReward:1 };
  if (bars.length < 15) return fallback;

  const closes   = bars.map(b => b.close);
  const price    = closes[closes.length - 1];
  const atrVal   = atr(bars, 14);
  const atrPct   = (atrVal / price) * 100;
  const dd       = peakDrawdown(closes, 60) * 100;
  const rsiVal   = rsi(closes);
  const volR     = volumeRatio(bars);
  const macdVal  = macd(closes);

  // Volatility score (0–100)
  const volScore = clamp(atrPct * 8, 0, 100);

  // RSI extremity adds risk
  const rsiRisk = rsiVal > 75 || rsiVal < 25 ? 20 : rsiVal > 65 || rsiVal < 35 ? 10 : 0;

  // Volume surge adds risk
  const volSurgeRisk = volR > 2.5 ? 15 : volR > 1.8 ? 8 : 0;

  // MACD divergence risk
  const macdRisk = Math.abs(macdVal.histogram) > atrVal * 0.5 ? 10 : 0;

  const score = Math.round(clamp(volScore + rsiRisk + volSurgeRisk + macdRisk, 0, 100));

  const level: RiskResult["level"] = score >= 75 ? "Extreme" : score >= 50 ? "Aggressive" : score >= 25 ? "Moderate" : "Safe";

  // ATR-based stop (1.5× ATR below price for longs)
  const stopLoss   = Math.round((price - atrVal * 1.5) * 100) / 100;

  // Target: 2.5:1 risk-reward from stop
  const riskAmt    = price - stopLoss;
  const targetPrice = Math.round((price + riskAmt * 2.5) * 100) / 100;
  const riskReward  = Math.round((targetPrice - price) / Math.max(riskAmt, 0.01) * 10) / 10;

  return {
    level, score, volatilityPct: round1(atrPct),
    drawdownRisk: round1(dd), stopLoss, targetPrice, riskReward,
  };
}

// ─── Engine 5: Emotion Engine ────────────────────────────────────────────────

export function computeEmotion(bars: OHLCVBar[]): EmotionResult {
  if (bars.length < 20) return { state:"Calm", fearScore:20, greedScore:20, description:"Insufficient data" };

  const closes  = bars.map(b => b.close);
  const rsiVal  = rsi(closes);
  const atrVal  = atr(bars, 14);
  const price   = closes[closes.length - 1];
  const atrPct  = (atrVal / price) * 100;
  const accl    = momentumAcceleration(closes, 10);
  const volR    = volumeRatio(bars);
  const dd      = peakDrawdown(closes, 30) * 100;

  // Fear index (0–100): high ATR + high drawdown + RSI falling = fear
  const fearScore = Math.round(clamp(
    atrPct * 5 + dd * 2 + (rsiVal < 40 ? (40 - rsiVal) * 1.5 : 0) + (accl < -0.01 ? 15 : 0),
    0, 100
  ));

  // Greed index (0–100): high RSI + surging volume + positive acceleration = greed
  const greedScore = Math.round(clamp(
    (rsiVal > 60 ? (rsiVal - 60) * 1.8 : 0) + (volR > 1.5 ? (volR - 1) * 20 : 0) + (accl > 0.01 ? 20 : 0),
    0, 100
  ));

  let state: string;
  if (fearScore > 70 && greedScore < 25)        state = "Panic — Market Stress";
  else if (greedScore > 70 && fearScore < 25)   state = "Euphoria — Extreme Greed";
  else if (fearScore > 50 && greedScore < 40)   state = "Fear — Risk Off";
  else if (greedScore > 50 && fearScore < 40)   state = "Greed — Risk On";
  else if (atrPct < 1.0 && Math.abs(accl) < 0.005) state = "Calm Consolidation";
  else if (fearScore > 40 && greedScore > 40)   state = "Volatility — Indecision";
  else                                           state = "Neutral — Balanced";

  const description = `RSI ${round1(rsiVal)} · ATR ${round1(atrPct)}% · Vol ${round1(volR)}× · DD ${round1(dd)}%`;

  return { state, fearScore, greedScore, description };
}

// ─── Master aggregator ───────────────────────────────────────────────────────

export function computeAllEngines(bars: OHLCVBar[]): Pick<AnalysisResult, "consensus"|"momentum"|"institutional"|"risk"|"emotion"|"rsi"|"macd"|"ema9"|"ema21"|"ema50"> {
  const closes = bars.map(b => b.close);
  const e9arr  = ema(closes, 9);
  const e21arr = ema(closes, 21);
  const e50arr = ema(closes, Math.min(50, closes.length));
  const rsiVal = rsi(closes);
  const m      = macd(closes);

  return {
    consensus:     computeConsensus(bars),
    momentum:      computeMomentum(bars),
    institutional: computeInstitutional(bars),
    risk:          computeRisk(bars),
    emotion:       computeEmotion(bars),
    rsi:           round1(rsiVal),
    macd:          { macd: m.macd, signal: m.signal, histogram: m.histogram },
    ema9:          e9arr.length  ? round1(e9arr[e9arr.length - 1])   : 0,
    ema21:         e21arr.length ? round1(e21arr[e21arr.length - 1]) : 0,
    ema50:         e50arr.length ? round1(e50arr[e50arr.length - 1]) : 0,
  };
}
