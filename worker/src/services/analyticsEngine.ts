/**
 * TradeSense Analytics Engine
 * Pure OHLCV-based intelligence — no external indicator APIs needed.
 */

export interface OHLCVBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Math helpers ────────────────────────────────────────────────────────────

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let e = values.slice(0, period).reduce((s, v) => s + v, 0) / period;
  result.push(e);
  for (let i = period; i < values.length; i++) {
    e = values[i] * k + e * (1 - k);
    result.push(e);
  }
  return result;
}

function computeRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  const gains = changes.map(c => Math.max(c, 0));
  const losses = changes.map(c => Math.max(-c, 0));
  let ag = gains.slice(0, period).reduce((s, v) => s + v, 0) / period;
  let al = losses.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (let i = period; i < gains.length; i++) {
    ag = (ag * (period - 1) + gains[i]) / period;
    al = (al * (period - 1) + losses[i]) / period;
  }
  return al === 0 ? 100 : 100 - 100 / (1 + ag / al);
}

function computeMACD(closes: number[]) {
  if (closes.length < 27) return { macd: 0, signal: 0, histogram: 0 };
  const e12 = ema(closes, 12);
  const e26 = ema(closes, 26);
  const macdLine = e12.slice(e12.length - e26.length).map((v, i) => v - e26[i]);
  const signalLine = ema(macdLine, 9);
  const last = macdLine[macdLine.length - 1];
  const sig = signalLine[signalLine.length - 1];
  return { macd: last, signal: sig, histogram: last - sig };
}

function computeATR(bars: OHLCVBar[], period = 14): number {
  if (bars.length < 2) return 0;
  const trs = bars.slice(1).map((b, i) => {
    const prev = bars[i].close;
    return Math.max(b.high - b.low, Math.abs(b.high - prev), Math.abs(b.low - prev));
  });
  return trs.slice(-period).reduce((s, v) => s + v, 0) / Math.min(period, trs.length);
}

function computeBB(closes: number[], period = 20, stdMult = 2) {
  const slice = closes.slice(-period);
  const mean = slice.reduce((s, v) => s + v, 0) / slice.length;
  const std = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / slice.length);
  return { upper: mean + stdMult * std, middle: mean, lower: mean - stdMult * std };
}

// ─── Output types ────────────────────────────────────────────────────────────

export interface ConsensusResult {
  signal: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  label: string;
  score: number;       // -100 to +100
  buyProb: number;     // 0–100 %
  sellProb: number;    // 0–100 %
  confidence: number;  // 0–100 %
  factors: { name: string; value: string; bias: "bull" | "bear" | "neutral" }[];
}

export interface MomentumResult {
  phase: "Accumulation" | "Breakout" | "Bullish Momentum" | "Exhaustion Risk" | "Distribution" | "Bearish Momentum" | "Oversold Bounce" | "Neutral";
  strength: number;       // 0–100
  acceleration: number;   // –100 to +100
  exhaustion: boolean;
  description: string;
}

export interface InstitutionalResult {
  detected: boolean;
  type: "Institutional Buying" | "Institutional Selling" | "Breakout Absorption" | "High Participation Zone" | "Normal Activity";
  confidence: number;  // 0–100
  description: string;
  volumeRatio: number; // current vs 20d avg
}

export interface RiskResult {
  level: "Safe" | "Moderate" | "Aggressive" | "Extreme";
  score: number;         // 0–100 (higher = riskier)
  volatilityPct: number; // ATR/price as %
  drawdownRisk: number;  // estimated max drawdown %
  stopLoss: number;      // suggested price
  targetPrice: number;   // suggested 1R target
  riskReward: number;    // ratio
}

export interface EmotionResult {
  state: "Panic Selling" | "Fear Zone" | "Calm Consolidation" | "Greed Expansion" | "Breakout Excitement" | "Euphoria";
  fearScore: number;   // 0–100
  greedScore: number;  // 0–100
  description: string;
}

export interface AnalyticsResult {
  consensus: ConsensusResult;
  momentum: MomentumResult;
  institutional: InstitutionalResult;
  risk: RiskResult;
  emotion: EmotionResult;
  tradeSummary: string;
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  ema9: number;
  ema21: number;
  ema50: number;
  computedAt: string;
}

// ─── Main engine ─────────────────────────────────────────────────────────────

export function computeAnalytics(bars: OHLCVBar[]): AnalyticsResult {
  const sorted = [...bars].sort((a, b) => a.time - b.time);
  const closes = sorted.map(b => b.close);
  const volumes = sorted.map(b => b.volume);
  const last = sorted[sorted.length - 1];
  const price = last.close;

  // Core indicators
  const rsi = computeRSI(closes);
  const macd = computeMACD(closes);
  const atr = computeATR(sorted);
  const bb = computeBB(closes);
  const bbPosition = (price - bb.lower) / (bb.upper - bb.lower || 1);

  const emaVals9  = ema(closes, 9);
  const emaVals21 = ema(closes, 21);
  const emaVals50 = ema(closes, 50);
  const ema9  = emaVals9[emaVals9.length - 1];
  const ema21 = emaVals21[emaVals21.length - 1];
  const ema50 = emaVals50[emaVals50.length - 1];

  // Volume analysis
  const vol20avg = volumes.slice(-21, -1).reduce((s, v) => s + v, 0) / 20;
  const volRatio = vol20avg > 0 ? last.volume / vol20avg : 1;

  // Momentum (10-day Rate of Change)
  const roc10 = sorted.length > 10
    ? ((price - sorted[sorted.length - 11].close) / sorted[sorted.length - 11].close) * 100
    : 0;
  // 3-day acceleration
  const roc3 = sorted.length > 3
    ? ((price - sorted[sorted.length - 4].close) / sorted[sorted.length - 4].close) * 100
    : 0;

  // ── 1. Consensus Engine ─────────────────────────────────────────────────

  let score = 0;
  const factors: ConsensusResult["factors"] = [];

  // EMA trend
  const emaShortBull = ema9 > ema21;
  const emaMedBull   = ema21 > ema50;
  if (emaShortBull) { score += 12; factors.push({ name: "EMA 9/21", value: "Bullish cross", bias: "bull" }); }
  else              { score -= 12; factors.push({ name: "EMA 9/21", value: "Bearish cross", bias: "bear" }); }
  if (emaMedBull)   { score += 12; factors.push({ name: "EMA 21/50", value: "Uptrend intact", bias: "bull" }); }
  else              { score -= 12; factors.push({ name: "EMA 21/50", value: "Downtrend", bias: "bear" }); }

  // RSI
  if (rsi < 30)       { score += 22; factors.push({ name: "RSI", value: `${rsi.toFixed(1)} — Oversold`, bias: "bull" }); }
  else if (rsi < 50)  { score += 8;  factors.push({ name: "RSI", value: `${rsi.toFixed(1)} — Below mid`, bias: "bull" }); }
  else if (rsi < 70)  { score -= 5;  factors.push({ name: "RSI", value: `${rsi.toFixed(1)} — Healthy`, bias: "neutral" }); }
  else if (rsi < 80)  { score -= 18; factors.push({ name: "RSI", value: `${rsi.toFixed(1)} — Overbought`, bias: "bear" }); }
  else                { score -= 30; factors.push({ name: "RSI", value: `${rsi.toFixed(1)} — Extreme`, bias: "bear" }); }

  // MACD
  if (macd.histogram > 0 && macd.macd > 0)       { score += 18; factors.push({ name: "MACD", value: "Bullish + above zero", bias: "bull" }); }
  else if (macd.histogram > 0 && macd.macd <= 0)  { score += 10; factors.push({ name: "MACD", value: "Bullish cross forming", bias: "bull" }); }
  else if (macd.histogram < 0 && macd.macd >= 0)  { score -= 10; factors.push({ name: "MACD", value: "Momentum fading", bias: "bear" }); }
  else                                             { score -= 18; factors.push({ name: "MACD", value: "Bearish + below zero", bias: "bear" }); }

  // Volume
  if (volRatio > 2.0 && roc3 > 0)  { score += 14; factors.push({ name: "Volume", value: `${volRatio.toFixed(1)}x surge (bull)`, bias: "bull" }); }
  else if (volRatio > 2.0 && roc3 < 0) { score -= 14; factors.push({ name: "Volume", value: `${volRatio.toFixed(1)}x surge (bear)`, bias: "bear" }); }
  else if (volRatio > 1.3)          { score += 5;  factors.push({ name: "Volume", value: `${volRatio.toFixed(1)}x above avg`, bias: "bull" }); }
  else                              { factors.push({ name: "Volume", value: `${volRatio.toFixed(1)}x avg`, bias: "neutral" }); }

  // Bollinger Band position
  if (bbPosition < 0.1)       { score += 10; factors.push({ name: "Bollinger", value: "Near lower band (reversal)", bias: "bull" }); }
  else if (bbPosition > 0.9)  { score -= 10; factors.push({ name: "Bollinger", value: "Near upper band (overbought)", bias: "bear" }); }
  else                        { factors.push({ name: "Bollinger", value: `Band position ${(bbPosition * 100).toFixed(0)}%`, bias: "neutral" }); }

  // Volatility risk
  const volPct = (atr / price) * 100;
  if (volPct > 4) { score -= 8; factors.push({ name: "Volatility", value: `ATR ${volPct.toFixed(1)}% (high risk)`, bias: "bear" }); }

  score = Math.max(-100, Math.min(100, score));
  const buyProb  = Math.round(((score + 100) / 200) * 100);
  const sellProb = 100 - buyProb;
  const confidence = Math.round(Math.min(100, Math.abs(score) * 1.2 + 30));

  let signal: ConsensusResult["signal"];
  let label: string;
  if      (score >= 60)  { signal = "STRONG_BUY";  label = `Strong Buy (${buyProb}%)`;  }
  else if (score >= 25)  { signal = "BUY";          label = `Buy (${buyProb}%)`;          }
  else if (score >= -25) { signal = "HOLD";         label = `Neutral (${confidence}% conf)`; }
  else if (score >= -60) { signal = "SELL";         label = `Sell (${sellProb}%)`;        }
  else                   { signal = "STRONG_SELL";  label = `Strong Sell (${sellProb}%)`; }

  const consensus: ConsensusResult = { signal, label, score, buyProb, sellProb, confidence, factors };

  // ── 2. Momentum Pulse ───────────────────────────────────────────────────

  const momentumStr = Math.min(100, Math.abs(roc10) * 8 + Math.abs(roc3) * 12);
  const acceleration = Math.max(-100, Math.min(100, roc3 * 15));
  const exhaustion = rsi > 72 && volRatio < 0.8 && roc3 < roc10 / 2;

  let phase: MomentumResult["phase"];
  if (rsi < 35 && roc10 < -5)           phase = "Oversold Bounce";
  else if (emaShortBull && roc10 < 2)    phase = "Accumulation";
  else if (roc10 > 5 && volRatio > 1.5)  phase = "Breakout";
  else if (roc10 > 2 && emaShortBull)    phase = "Bullish Momentum";
  else if (exhaustion)                    phase = "Exhaustion Risk";
  else if (!emaShortBull && roc10 < -2)  phase = "Bearish Momentum";
  else if (roc10 < -5)                   phase = "Distribution";
  else                                    phase = "Neutral";

  const momentum: MomentumResult = {
    phase,
    strength: Math.round(momentumStr),
    acceleration: Math.round(acceleration),
    exhaustion,
    description: `${phase} — ${roc10 > 0 ? "+" : ""}${roc10.toFixed(2)}% 10-day move, ${volRatio.toFixed(1)}x volume`,
  };

  // ── 3. Institutional Activity ────────────────────────────────────────────

  const rangeExpansion = (last.high - last.low) / (atr || 1);
  const isHighVol = volRatio > 2.2;
  const isRangeExp = rangeExpansion > 1.8;
  const candleBody = Math.abs(last.close - last.open) / (last.high - last.low || 1);

  let instType: InstitutionalResult["type"] = "Normal Activity";
  let instConf = 20;
  let instDesc = "Volume and price action within normal parameters.";

  if (isHighVol && isRangeExp && roc3 > 1.5) {
    instType = "Institutional Buying";
    instConf = Math.min(95, 55 + volRatio * 8);
    instDesc = `Unusual volume (${volRatio.toFixed(1)}x avg) with range expansion signals large participant activity.`;
  } else if (isHighVol && isRangeExp && roc3 < -1.5) {
    instType = "Institutional Selling";
    instConf = Math.min(95, 55 + volRatio * 8);
    instDesc = `High-volume distribution detected. Price closed down on ${volRatio.toFixed(1)}x normal volume.`;
  } else if (isHighVol && candleBody < 0.3 && rangeExpansion > 1.5) {
    instType = "Breakout Absorption";
    instConf = 65;
    instDesc = "High volume with small candle body — potential absorption of breakout. Watch next session.";
  } else if (volRatio > 1.5) {
    instType = "High Participation Zone";
    instConf = 45;
    instDesc = `Above-average volume (${volRatio.toFixed(1)}x) suggests increased market participation.`;
  }

  const institutional: InstitutionalResult = {
    detected: instConf > 40,
    type: instType,
    confidence: Math.round(instConf),
    description: instDesc,
    volumeRatio: parseFloat(volRatio.toFixed(2)),
  };

  // ── 4. Risk Engine ───────────────────────────────────────────────────────

  const volRisk = Math.min(100, volPct * 18);
  const trendRisk = !emaShortBull ? 25 : 0;
  const rsiRisk = rsi > 75 ? 20 : rsi < 30 ? 10 : 0;
  const riskScore = Math.round(Math.min(100, volRisk * 0.5 + trendRisk + rsiRisk + (volRatio > 2 ? 10 : 0)));

  let riskLevel: RiskResult["level"];
  if (riskScore < 25)       riskLevel = "Safe";
  else if (riskScore < 50)  riskLevel = "Moderate";
  else if (riskScore < 75)  riskLevel = "Aggressive";
  else                      riskLevel = "Extreme";

  const stopLoss    = parseFloat((price - 2 * atr).toFixed(2));
  const targetPrice = parseFloat((price + 3 * atr).toFixed(2));
  const riskReward  = parseFloat(((targetPrice - price) / (price - stopLoss || 1)).toFixed(2));

  const risk: RiskResult = {
    level: riskLevel,
    score: riskScore,
    volatilityPct: parseFloat(volPct.toFixed(2)),
    drawdownRisk: parseFloat(Math.min(40, volPct * 3).toFixed(1)),
    stopLoss,
    targetPrice,
    riskReward,
  };

  // ── 5. Emotion Engine ────────────────────────────────────────────────────

  const fearScore  = Math.round(Math.min(100, (Math.max(0, 50 - rsi) / 50) * 60 + (roc10 < 0 ? Math.abs(roc10) * 3 : 0) + (volRatio > 2 && roc3 < 0 ? 20 : 0)));
  const greedScore = Math.round(Math.min(100, (Math.max(0, rsi - 50) / 50) * 60 + (roc10 > 0 ? roc10 * 3 : 0) + (volRatio > 2 && roc3 > 0 ? 20 : 0)));

  let emotionState: EmotionResult["state"];
  let emotionDesc: string;
  if (fearScore > 70)                             { emotionState = "Panic Selling";       emotionDesc = "Extreme fear driving sharp selloff. Contrarian opportunity may be forming."; }
  else if (fearScore > 45)                        { emotionState = "Fear Zone";            emotionDesc = "Market participants are cautious. Watch for stabilization signals."; }
  else if (greedScore > 75)                       { emotionState = "Euphoria";             emotionDesc = "Extreme greed. Markets may be overextended — risk of sharp reversal."; }
  else if (greedScore > 50 && volRatio > 1.5)    { emotionState = "Breakout Excitement";  emotionDesc = "High enthusiasm with volume surge. Momentum traders active."; }
  else if (greedScore > 40)                       { emotionState = "Greed Expansion";      emotionDesc = "Positive sentiment with broad participation. Trend likely to continue."; }
  else                                            { emotionState = "Calm Consolidation";   emotionDesc = "Low volatility, balanced sentiment. Potential coil before next move."; }

  const emotion: EmotionResult = { state: emotionState, fearScore, greedScore, description: emotionDesc };

  // ── 6. AI Trade Summary ──────────────────────────────────────────────────

  const trendWord   = emaShortBull && emaMedBull ? "bullish" : !emaShortBull && !emaMedBull ? "bearish" : "mixed";
  const rsiWord     = rsi < 35 ? "oversold" : rsi > 65 ? "overbought" : "neutral";
  const macdWord    = macd.histogram > 0 ? "positive" : "negative";
  const volWord     = volRatio > 1.5 ? "elevated" : "normal";
  const momentWord  = Math.abs(roc10) > 5 ? `strong ${roc10 > 0 ? "upward" : "downward"}` : "measured";

  const tradeSummary = [
    `Price action reflects a ${trendWord} trend structure with ${momentWord} momentum over the past 10 sessions.`,
    `RSI stands at ${rsi.toFixed(1)}, placing the stock in ${rsiWord} territory.`,
    `MACD histogram is ${macdWord}, signaling ${macd.histogram > 0 ? "continued buying pressure" : "selling pressure"}.`,
    `Volume is ${volWord} at ${volRatio.toFixed(1)}x the 20-day average — ${volRatio > 1.5 ? "suggesting institutional participation" : "indicating retail-led price action"}.`,
    signal === "STRONG_BUY" || signal === "BUY"
      ? "Multiple indicators align for a potential long setup. Confirm with price action near key support."
      : signal === "STRONG_SELL" || signal === "SELL"
      ? "Indicators suggest caution. Consider reducing exposure or monitoring for further deterioration."
      : "No clear directional edge. Wait for a higher-probability setup before committing capital.",
  ].join(" ");

  return {
    consensus,
    momentum,
    institutional,
    risk,
    emotion,
    tradeSummary,
    rsi,
    macd,
    ema9,
    ema21,
    ema50,
    computedAt: new Date().toISOString(),
  };
}
