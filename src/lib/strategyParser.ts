import type { OHLCVBar } from "@/types";
import {
  ema, rsiSeries, macdSeries, bollingerBands,
  vwap as calcVwap, momentumSeries, stochasticSeries,
} from "./chartIndicators";
import type { Condition, ConditionGroup, Indicator, Operator, Strategy } from "./strategySchema";

/* ── Compute all indicator values for the last bar ─────────────── */
export interface IndicatorSnapshot {
  Price: number;
  RSI: number;
  MACD_line: number; MACD_signal: number; MACD_hist: number;
  EMA9: number; EMA21: number; EMA50: number; EMA200: number;
  BB_upper: number; BB_lower: number; BB_mid: number;
  VWAP: number; ATR: number; Volume: number;
  Stoch_K: number; Stoch_D: number; Momentum: number;
  // previous bar (for crossover detection)
  prev_MACD_line: number; prev_MACD_signal: number;
  prev_RSI: number; prev_Stoch_K: number; prev_Stoch_D: number;
}

function last<T extends { value: number }>(arr: T[]): number {
  return arr.length ? arr[arr.length - 1].value : 0;
}
function prev<T extends { value: number }>(arr: T[]): number {
  return arr.length > 1 ? arr[arr.length - 2].value : 0;
}

function calcATR(bars: OHLCVBar[], period = 14): number {
  if (bars.length < period + 1) return 0;
  const trs = bars.slice(1).map((b, i) =>
    Math.max(b.high - b.low, Math.abs(b.high - bars[i].close), Math.abs(b.low - bars[i].close))
  );
  return trs.slice(-period).reduce((a, v) => a + v, 0) / period;
}

export function buildSnapshot(bars: OHLCVBar[]): IndicatorSnapshot | null {
  if (bars.length < 35) return null;
  const bar = bars[bars.length - 1];
  const rsiArr  = rsiSeries(bars);
  const { macd, sig, hist } = macdSeries(bars);
  const bb  = bollingerBands(bars);
  const vw  = calcVwap(bars);
  const stoch = stochasticSeries(bars);
  const mom = momentumSeries(bars);
  const e9  = ema(bars, 9);
  const e21 = ema(bars, 21);
  const e50 = ema(bars, 50);
  const e200= ema(bars, 200);

  return {
    Price: bar.close,
    RSI: last(rsiArr),
    MACD_line: last(macd), MACD_signal: last(sig), MACD_hist: last(hist),
    EMA9: last(e9), EMA21: last(e21), EMA50: last(e50), EMA200: last(e200),
    BB_upper: last(bb.upper), BB_lower: last(bb.lower), BB_mid: last(bb.mid),
    VWAP: last(vw),
    ATR: calcATR(bars),
    Volume: bar.volume,
    Stoch_K: last(stoch.k), Stoch_D: last(stoch.d),
    Momentum: last(mom),
    prev_MACD_line: prev(macd), prev_MACD_signal: prev(sig),
    prev_RSI: prev(rsiArr), prev_Stoch_K: prev(stoch.k), prev_Stoch_D: prev(stoch.d),
  };
}

/* ── Evaluate a single condition ────────────────────────────────── */
function getValue(snap: IndicatorSnapshot, key: Indicator | number): number {
  if (typeof key === "number") return key;
  return snap[key as keyof IndicatorSnapshot] ?? 0;
}

function evalCondition(c: Condition, snap: IndicatorSnapshot): boolean {
  const lv = getValue(snap, c.left);
  const rv = getValue(snap, c.right);
  switch (c.operator) {
    case ">":  return lv > rv;
    case "<":  return lv < rv;
    case ">=": return lv >= rv;
    case "<=": return lv <= rv;
    case "==": return Math.abs(lv - rv) < 0.001;
    case "crosses_above": {
      // current left > right AND previous left <= right
      const prevL = getValue(snap, `prev_${c.left}` as Indicator) || lv;
      return prevL <= rv && lv > rv;
    }
    case "crosses_below": {
      const prevL = getValue(snap, `prev_${c.left}` as Indicator) || lv;
      return prevL >= rv && lv < rv;
    }
    default: return false;
  }
}

/* ── Evaluate a condition group (recursive) ──────────────────────── */
export function evalGroup(group: ConditionGroup, snap: IndicatorSnapshot): boolean {
  const results = group.conditions.map(item => {
    if ("conditions" in item) return evalGroup(item as ConditionGroup, snap);
    return evalCondition(item as Condition, snap);
  });
  return group.logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}

/* ── Full strategy evaluation ───────────────────────────────────── */
export interface EvalResult {
  entrySignal: boolean;
  exitSignal:  boolean;
  snapshot:    IndicatorSnapshot | null;
  errors:      string[];
}

export function evaluateStrategy(strategy: Strategy, bars: OHLCVBar[]): EvalResult {
  const errors: string[] = [];
  const snapshot = buildSnapshot(bars);
  if (!snapshot) {
    errors.push("Insufficient data (need ≥ 35 bars)");
    return { entrySignal: false, exitSignal: false, snapshot: null, errors };
  }
  return {
    entrySignal: evalGroup(strategy.entry, snapshot),
    exitSignal:  evalGroup(strategy.exit,  snapshot),
    snapshot,
    errors,
  };
}

/* ── Validation ─────────────────────────────────────────────────── */
export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

function validateGroup(group: ConditionGroup, path: string): string[] {
  const issues: string[] = [];
  if (!group.conditions.length) issues.push(`${path}: group has no conditions`);
  group.conditions.forEach((item, i) => {
    if ("conditions" in item) {
      issues.push(...validateGroup(item as ConditionGroup, `${path}[${i}]`));
    } else {
      const c = item as Condition;
      if (typeof c.right === "number" && isNaN(c.right)) {
        issues.push(`${path}[${i}]: value is not a number`);
      }
    }
  });
  return issues;
}

export function validateStrategy(s: Strategy): ValidationResult {
  const issues: string[] = [];
  if (!s.name.trim()) issues.push("Strategy name is required");
  if (s.risk.positionSize <= 0 || s.risk.positionSize > 100)
    issues.push("Position size must be 1–100%");
  if (s.risk.stopLoss !== null && s.risk.stopLoss <= 0)
    issues.push("Stop loss must be > 0%");
  if (s.risk.takeProfit !== null && s.risk.takeProfit <= 0)
    issues.push("Take profit must be > 0%");
  issues.push(...validateGroup(s.entry, "Entry"));
  issues.push(...validateGroup(s.exit,  "Exit"));
  return { valid: issues.length === 0, issues };
}
