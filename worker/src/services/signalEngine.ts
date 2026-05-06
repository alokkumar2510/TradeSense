import type { RSIResult } from "./alphaVantage";
import type { MACDResult } from "./alphaVantage";

export type SignalStrength =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL"
  | "INSUFFICIENT_DATA";

export interface Signal {
  strength:    SignalStrength;
  score:       number;  // -100 to +100
  explanation: string;
  rsiSummary:  string;
  macdSummary: string;
  generatedAt: string;
}

export function generateSignal(
  rsi:  RSIResult | null,
  macd: MACDResult | null
): Signal {
  const now = new Date().toISOString();

  if (!rsi || !macd) {
    return {
      strength:    "INSUFFICIENT_DATA",
      score:       0,
      explanation: "Unable to compute signal — indicator data unavailable. This may be due to API rate limits. Please try again in a moment.",
      rsiSummary:  "RSI data unavailable",
      macdSummary: "MACD data unavailable",
      generatedAt: now,
    };
  }

  const rsiVal  = rsi.value;
  const macdVal = macd.macd;
  const hist    = macd.histogram;

  // ─── Score components (each -50 to +50) ──────────────────────────────────
  let rsiScore  = 0;
  let macdScore = 0;

  // RSI scoring
  if (rsiVal < 20)       rsiScore =  50;
  else if (rsiVal < 30)  rsiScore =  35;
  else if (rsiVal < 40)  rsiScore =  15;
  else if (rsiVal < 60)  rsiScore =   0;  // neutral zone
  else if (rsiVal < 70)  rsiScore = -15;
  else if (rsiVal < 80)  rsiScore = -35;
  else                   rsiScore = -50;

  // MACD scoring — histogram direction matters more than absolute value
  if (hist > 0 && macdVal > 0)       macdScore =  50;
  else if (hist > 0 && macdVal <= 0) macdScore =  25;
  else if (hist <= 0 && macdVal > 0) macdScore = -25;
  else                               macdScore = -50;

  const score = rsiScore + macdScore; // range: -100 to +100

  // ─── Strength mapping ─────────────────────────────────────────────────────
  let strength: SignalStrength;
  if      (score >=  70) strength = "STRONG_BUY";
  else if (score >=  30) strength = "BUY";
  else if (score >= -30) strength = "HOLD";
  else if (score >= -70) strength = "SELL";
  else                   strength = "STRONG_SELL";

  // ─── Human-readable summaries ─────────────────────────────────────────────
  const rsiSummary = formatRSI(rsiVal);
  const macdSummary = formatMACD(macdVal, hist);
  const explanation = buildExplanation(strength, rsiSummary, macdSummary);

  return { strength, score, explanation, rsiSummary, macdSummary, generatedAt: now };
}

function formatRSI(v: number): string {
  if (v < 30) return `RSI at ${v.toFixed(1)} — stock is oversold, potential buying opportunity`;
  if (v > 70) return `RSI at ${v.toFixed(1)} — stock is overbought, potential selling pressure`;
  return `RSI at ${v.toFixed(1)} — in neutral zone, no extreme pressure`;
}

function formatMACD(macd: number, hist: number): string {
  const dir = hist > 0 ? "positive (bullish momentum)" : "negative (bearish momentum)";
  return `MACD histogram is ${dir} at ${hist.toFixed(4)}, MACD line at ${macd.toFixed(4)}`;
}

function buildExplanation(
  strength: SignalStrength,
  rsiSummary: string,
  macdSummary: string
): string {
  const parts: string[] = [];

  switch (strength) {
    case "STRONG_BUY":
      parts.push("🟢 STRONG BUY signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Both indicators align bullishly. Consider this a high-conviction entry opportunity, but always confirm with your own research and risk tolerance.");
      break;
    case "BUY":
      parts.push("🟢 BUY signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Indicators lean bullish but not extreme. Watch for confirmation before entering a full position.");
      break;
    case "HOLD":
      parts.push("🟡 HOLD — neutral signal.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("No strong directional bias. Maintain existing positions and wait for a clearer setup.");
      break;
    case "SELL":
      parts.push("🔴 SELL signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Indicators lean bearish. Consider reducing exposure or tightening stop-losses.");
      break;
    case "STRONG_SELL":
      parts.push("🔴 STRONG SELL signal detected.");
      parts.push(`${rsiSummary}.`);
      parts.push(`${macdSummary}.`);
      parts.push("Both indicators align bearishly. High-conviction exit or short signal. Proceed with caution and proper risk management.");
      break;
    default:
      parts.push("⚠️ Insufficient data to generate a signal.");
  }

  // Disclaimer
  parts.push("\n⚠️ This is algorithmic analysis only. Not financial advice. Always do your own due diligence.");

  return parts.join(" ");
}
