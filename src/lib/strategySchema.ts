/* ── Strategy Schema Types ────────────────────────────────────── */

export type Timeframe = "5m" | "15m" | "1H" | "4H" | "1D";
export type Operator  = ">" | "<" | ">=" | "<=" | "==" | "crosses_above" | "crosses_below";
export type Logic     = "AND" | "OR";

export type Indicator =
  | "RSI" | "MACD_line" | "MACD_signal" | "MACD_hist"
  | "EMA9" | "EMA21" | "EMA50" | "EMA200"
  | "BB_upper" | "BB_lower" | "BB_mid"
  | "VWAP" | "ATR" | "Volume" | "Price"
  | "Stoch_K" | "Stoch_D" | "Momentum";

export interface Condition {
  id: string;
  left: Indicator;
  operator: Operator;
  right: Indicator | number;   // indicator-vs-indicator or indicator-vs-value
  timeframe: Timeframe;
}

export interface ConditionGroup {
  id: string;
  logic: Logic;            // how conditions inside are joined
  conditions: (Condition | ConditionGroup)[];  // nestable
}

export interface RiskParams {
  stopLoss:      number | null;  // % below entry
  takeProfit:    number | null;  // % above entry
  trailingStop:  number | null;  // % trailing
  positionSize:  number;         // % of capital per trade
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  symbol: string;           // e.g. "RELIANCE.NS" or "ANY"
  timeframe: Timeframe;
  entry: ConditionGroup;
  exit:  ConditionGroup;
  risk:  RiskParams;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  uid: string;
}

/* ── Defaults ─────────────────────────────────────────────────── */
export const DEFAULT_RISK: RiskParams = {
  stopLoss: 2, takeProfit: 4, trailingStop: null, positionSize: 5,
};

export function newCondition(tf: Timeframe = "1D"): Condition {
  return { id: crypto.randomUUID(), left: "RSI", operator: "<", right: 30, timeframe: tf };
}

export function newGroup(logic: Logic = "AND"): ConditionGroup {
  return { id: crypto.randomUUID(), logic, conditions: [newCondition()] };
}

export function newStrategy(uid: string): Strategy {
  return {
    id: crypto.randomUUID(),
    name: "New Strategy",
    description: "",
    symbol: "ANY",
    timeframe: "1D",
    entry: newGroup("AND"),
    exit:  newGroup("OR"),
    risk: { ...DEFAULT_RISK },
    active: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    uid,
  };
}

/* ── Indicator metadata for UI dropdowns ─────────────────────── */
export const INDICATORS: { value: Indicator; label: string; unit?: string }[] = [
  { value: "Price",       label: "Price",            unit: "₹" },
  { value: "RSI",         label: "RSI (14)",         unit: "" },
  { value: "MACD_line",   label: "MACD Line",        unit: "" },
  { value: "MACD_signal", label: "MACD Signal",      unit: "" },
  { value: "MACD_hist",   label: "MACD Histogram",   unit: "" },
  { value: "EMA9",        label: "EMA 9",            unit: "₹" },
  { value: "EMA21",       label: "EMA 21",           unit: "₹" },
  { value: "EMA50",       label: "EMA 50",           unit: "₹" },
  { value: "EMA200",      label: "EMA 200",          unit: "₹" },
  { value: "BB_upper",    label: "BB Upper",         unit: "₹" },
  { value: "BB_lower",    label: "BB Lower",         unit: "₹" },
  { value: "BB_mid",      label: "BB Mid",           unit: "₹" },
  { value: "VWAP",        label: "VWAP",             unit: "₹" },
  { value: "ATR",         label: "ATR (14)",         unit: "" },
  { value: "Volume",      label: "Volume",           unit: "" },
  { value: "Stoch_K",     label: "Stochastic %K",   unit: "" },
  { value: "Stoch_D",     label: "Stochastic %D",   unit: "" },
  { value: "Momentum",    label: "Momentum",         unit: "" },
];

export const OPERATORS: { value: Operator; label: string }[] = [
  { value: ">",            label: ">" },
  { value: "<",            label: "<" },
  { value: ">=",           label: ">=" },
  { value: "<=",           label: "<=" },
  { value: "==",           label: "==" },
  { value: "crosses_above",label: "crosses above" },
  { value: "crosses_below",label: "crosses below" },
];

export const TIMEFRAMES: Timeframe[] = ["5m","15m","1H","4H","1D"];
