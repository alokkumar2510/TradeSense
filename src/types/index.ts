// ─── Market Data ─────────────────────────────────────────────────────────────

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  pe: number;
  exchange: string;  // "NSE" | "BSE" | any FMP exchange string
  currency: string;
  timestamp: number;
}

export interface OHLCVBar {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Indicators ──────────────────────────────────────────────────────────────

export interface RSIData {
  value: number;
  timestamp: string;
}

export interface MACDData {
  macd: number;
  signal: number;
  histogram: number;
  timestamp: string;
}

export interface IndicatorPayload {
  rsi: RSIData | null;
  macd: MACDData | null;
  staleness?: "fresh" | "stale"; // stale = served from cache fallback
}

// ─── Analytics Engine ────────────────────────────────────────────────────────

export interface ConsensusResult {
  signal: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  label: string;
  score: number;
  buyProb: number;
  sellProb: number;
  confidence: number;
  factors: { name: string; value: string; bias: "bull" | "bear" | "neutral" }[];
}

export interface MomentumResult {
  phase: string;
  strength: number;
  acceleration: number;
  exhaustion: boolean;
  description: string;
}

export interface InstitutionalResult {
  detected: boolean;
  type: string;
  confidence: number;
  description: string;
  volumeRatio: number;
}

export interface RiskResult {
  level: "Safe" | "Moderate" | "Aggressive" | "Extreme";
  score: number;
  volatilityPct: number;
  drawdownRisk: number;
  stopLoss: number;
  targetPrice: number;
  riskReward: number;
}

export interface EmotionResult {
  state: string;
  fearScore: number;
  greedScore: number;
  description: string;
}

export interface AnalysisResult {
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

// ─── Signal Engine ───────────────────────────────────────────────────────────

export type SignalStrength = "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL" | "INSUFFICIENT_DATA";

export interface Signal {
  strength: SignalStrength;
  score: number; // -100 to +100
  explanation: string;
  rsiSummary: string;
  macdSummary: string;
  generatedAt: string;
}

// ─── News ────────────────────────────────────────────────────────────────────

export type SentimentLabel = "Positive" | "Neutral" | "Negative";

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: SentimentLabel;
  image?: string;
}

// ─── Portfolio & Transactions ─────────────────────────────────────────────────

export type TradeType = "BUY" | "SELL";
export type Exchange = "NSE" | "BSE";

export interface ChargesBreakdown {
  brokerage: number;
  stt: number;
  gst: number;
  stampDuty: number;
  exchangeCharge: number;
  total: number;
}

export interface Transaction {
  txnId: string;
  userId: string;
  symbol: string;
  exchange: Exchange;
  type: TradeType;
  quantity: number;
  price: number;
  date: string; // ISO date string "YYYY-MM-DD"
  charges: ChargesBreakdown;
  createdAt: string;
}

export interface Holding {
  symbol: string;
  exchange: Exchange;
  quantity: number;
  totalInvestment: number;
  avgBuyPrice: number; // computed: totalInvestment / quantity
  currentPrice?: number;
  currentValue?: number;
  unrealizedPL?: number;
  unrealizedPLPercent?: number;
}

// ─── Profit Engine ───────────────────────────────────────────────────────────

export type TaxType = "STCG" | "LTCG";

export interface ProfitCalculation {
  grossProfit: number;
  charges: ChargesBreakdown;
  taxType: TaxType;
  taxableAmount: number;
  taxAmount: number;
  netProfit: number;
  holdingDays: number;
}

// ─── Watchlist ───────────────────────────────────────────────────────────────

export interface WatchlistItem {
  symbol: string;
  exchange: Exchange;
  addedAt: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

// ─── Add Trade ───────────────────────────────────────────────────────────────

/** Payload passed from AddTradeModal → portfolio page → usePortfolio.addTrade */
export interface AddTradePayload {
  symbol:   string;
  exchange: Exchange;
  type:     TradeType;
  quantity: number;
  price:    number;
  date:     string;
}

// ─── API Response wrappers ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  code: "RATE_LIMITED" | "NOT_FOUND" | "INSUFFICIENT_DATA" | "UNAUTHORIZED" | "SERVER_ERROR";
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
