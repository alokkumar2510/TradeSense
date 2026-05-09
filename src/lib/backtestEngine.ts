import type { OHLCVBar } from "@/types";
import { buildSnapshot } from "./strategyParser";
import { evalGroup } from "./strategyParser";
import type { Strategy } from "./strategySchema";

/* ── Constants ────────────────────────────────────────────────────── */
const SLIPPAGE_PCT   = 0.05 / 100;   // 0.05% per trade
const BROKERAGE_PCT  = 0.03 / 100;   // 0.03% per leg
const STT_PCT        = 0.1  / 100;   // 0.1% on sell (Indian equities)
const CAPITAL        = 100_000;       // ₹1 lakh default

/* ── Types ────────────────────────────────────────────────────────── */
export interface Trade {
  id:         number;
  entryBar:   number;       // bar index
  exitBar:    number;
  entryPrice: number;
  exitPrice:  number;
  qty:        number;
  pnl:        number;       // net PnL after costs
  pnlPct:     number;
  exitReason: "signal" | "sl" | "tp" | "trailing" | "eod";
  entryTime:  number;
  exitTime:   number;
  mae:        number;       // max adverse excursion %
  mfe:        number;       // max favorable excursion %
}

export interface EquityPoint { time: number; value: number; drawdown: number; }

export interface BacktestResult {
  trades:       Trade[];
  equity:       EquityPoint[];
  metrics:      BacktestMetrics;
  config:       BacktestConfig;
}

export interface BacktestConfig {
  symbol:      string;
  capital:     number;
  slippagePct: number;
  brokeragePct:number;
  from:        number;
  to:          number;
}

export interface BacktestMetrics {
  totalTrades:   number;
  winRate:       number;    // %
  profitFactor:  number;
  expectancy:    number;    // ₹ per trade
  netPnl:        number;
  netPnlPct:     number;
  maxDrawdown:   number;    // %
  maxDrawdownAbs:number;    // ₹
  sharpeRatio:   number;
  avgRR:         number;
  avgWin:        number;
  avgLoss:       number;
  bestTrade:     number;
  worstTrade:    number;
  avgHoldBars:   number;
  totalBrokerage:number;
}

/* ── Cost helpers ─────────────────────────────────────────────────── */
function entryCost(price: number, qty: number) {
  return price * qty * (SLIPPAGE_PCT + BROKERAGE_PCT);
}
function exitCost(price: number, qty: number) {
  return price * qty * (SLIPPAGE_PCT + BROKERAGE_PCT + STT_PCT);
}

/* ── Core simulation ──────────────────────────────────────────────── */
export function runBacktest(
  strategy: Strategy,
  bars: OHLCVBar[],
  capital = CAPITAL,
): BacktestResult {
  const config: BacktestConfig = {
    symbol:       strategy.symbol,
    capital,
    slippagePct:  SLIPPAGE_PCT * 100,
    brokeragePct: BROKERAGE_PCT * 100,
    from: bars[0]?.time as number * 1000 || 0,
    to:   bars[bars.length - 1]?.time as number * 1000 || 0,
  };

  const WARMUP = 35; // min bars needed for indicators
  const trades: Trade[] = [];
  const equity: EquityPoint[] = [];

  let cash         = capital;
  let peakEquity   = capital;
  let maxDD        = 0;
  let tradeId      = 0;
  let inPosition   = false;
  let entryPrice   = 0;
  let entryBar     = 0;
  let entryTime    = 0;
  let qty          = 0;
  let highSinceBuy = 0;   // for trailing stop
  let mfe          = 0;
  let mae          = 0;
  let totalBrokerage = 0;

  const { stopLoss, takeProfit, trailingStop, positionSize } = strategy.risk;

  for (let i = WARMUP; i < bars.length; i++) {
    const bar   = bars[i];
    const slice = bars.slice(0, i + 1);
    const snap  = buildSnapshot(slice);
    const barTs = (bar.time as number) * 1000;

    const curEquity = cash + (inPosition ? qty * bar.close : 0);
    peakEquity      = Math.max(peakEquity, curEquity);
    const dd        = ((peakEquity - curEquity) / peakEquity) * 100;
    maxDD           = Math.max(maxDD, dd);
    equity.push({ time: barTs, value: curEquity, drawdown: -dd });

    if (inPosition) {
      // track MFE / MAE
      const unrealPct = ((bar.close - entryPrice) / entryPrice) * 100;
      mfe = Math.max(mfe, unrealPct);
      mae = Math.min(mae, unrealPct);

      // trailing stop high
      highSinceBuy = Math.max(highSinceBuy, bar.high);

      let exitReason: Trade["exitReason"] | null = null;
      let exitPx = bar.close;

      // SL check (intra-bar low)
      if (stopLoss !== null) {
        const slPrice = entryPrice * (1 - stopLoss / 100);
        if (bar.low <= slPrice) { exitPx = slPrice; exitReason = "sl"; }
      }
      // TP check (intra-bar high)
      if (!exitReason && takeProfit !== null) {
        const tpPrice = entryPrice * (1 + takeProfit / 100);
        if (bar.high >= tpPrice) { exitPx = tpPrice; exitReason = "tp"; }
      }
      // Trailing stop
      if (!exitReason && trailingStop !== null) {
        const tsPrice = highSinceBuy * (1 - trailingStop / 100);
        if (bar.low <= tsPrice) { exitPx = tsPrice; exitReason = "trailing"; }
      }
      // Strategy exit signal
      if (!exitReason && snap && evalGroup(strategy.exit, snap)) {
        exitReason = "signal";
      }
      // EOD / last bar
      if (!exitReason && i === bars.length - 1) {
        exitReason = "eod";
      }

      if (exitReason) {
        const cost = exitCost(exitPx, qty);
        totalBrokerage += cost;
        const proceeds = exitPx * qty - cost;
        const entrycost = entryCost(entryPrice, qty);
        const pnl = proceeds - (entryPrice * qty + entrycost);
        const pnlPct = (pnl / (entryPrice * qty)) * 100;
        cash += proceeds;

        trades.push({
          id: tradeId++, entryBar, exitBar: i,
          entryPrice, exitPrice: exitPx, qty,
          pnl, pnlPct, exitReason,
          entryTime, exitTime: barTs,
          mae, mfe,
        });

        inPosition = false; entryPrice = 0; qty = 0;
        highSinceBuy = 0; mfe = 0; mae = 0;
      }
    } else {
      // Check entry
      if (snap && evalGroup(strategy.entry, snap)) {
        const tradeCapital = cash * (positionSize / 100);
        const cost         = entryCost(bar.close, 1);
        qty = Math.floor(tradeCapital / (bar.close + cost));
        if (qty < 1) continue;

        const actualCost = entryCost(bar.close, qty);
        totalBrokerage  += actualCost;
        cash            -= bar.close * qty + actualCost;
        entryPrice       = bar.close;
        entryBar         = i;
        entryTime        = barTs;
        highSinceBuy     = bar.high;
        mfe              = 0; mae = 0;
        inPosition       = true;
      }
    }
  }

  return {
    trades,
    equity,
    metrics: calcMetrics(trades, equity, capital, totalBrokerage),
    config,
  };
}

/* ── Metrics calculation ──────────────────────────────────────────── */
function calcMetrics(
  trades: Trade[],
  equity: EquityPoint[],
  capital: number,
  totalBrokerage: number,
): BacktestMetrics {
  if (!trades.length) {
    return {
      totalTrades: 0, winRate: 0, profitFactor: 0, expectancy: 0,
      netPnl: 0, netPnlPct: 0, maxDrawdown: 0, maxDrawdownAbs: 0,
      sharpeRatio: 0, avgRR: 0, avgWin: 0, avgLoss: 0,
      bestTrade: 0, worstTrade: 0, avgHoldBars: 0, totalBrokerage,
    };
  }

  const winners = trades.filter(t => t.pnl > 0);
  const losers  = trades.filter(t => t.pnl <= 0);
  const grossWin  = winners.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losers.reduce((s, t) => s + t.pnl, 0));

  const netPnl    = trades.reduce((s, t) => s + t.pnl, 0);
  const finalEq   = equity[equity.length - 1]?.value ?? capital;
  const maxDD     = Math.min(...equity.map(e => e.drawdown));

  // Sharpe (simplified daily returns)
  const returns   = equity.slice(1).map((e, i) => (e.value - equity[i].value) / equity[i].value);
  const meanRet   = returns.reduce((s, r) => s + r, 0) / (returns.length || 1);
  const stdRet    = Math.sqrt(returns.reduce((s, r) => s + (r - meanRet) ** 2, 0) / (returns.length || 1));
  const sharpe    = stdRet > 0 ? (meanRet / stdRet) * Math.sqrt(252) : 0;

  return {
    totalTrades:    trades.length,
    winRate:        (winners.length / trades.length) * 100,
    profitFactor:   grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0,
    expectancy:     netPnl / trades.length,
    netPnl,
    netPnlPct:      ((finalEq - capital) / capital) * 100,
    maxDrawdown:    Math.abs(maxDD),
    maxDrawdownAbs: (Math.abs(maxDD) / 100) * capital,
    sharpeRatio:    parseFloat(sharpe.toFixed(2)),
    avgRR:          losers.length > 0
      ? (grossWin / winners.length) / (grossLoss / losers.length)
      : 0,
    avgWin:         winners.length ? grossWin / winners.length : 0,
    avgLoss:        losers.length  ? grossLoss / losers.length  : 0,
    bestTrade:      Math.max(...trades.map(t => t.pnl)),
    worstTrade:     Math.min(...trades.map(t => t.pnl)),
    avgHoldBars:    trades.reduce((s, t) => s + (t.exitBar - t.entryBar), 0) / trades.length,
    totalBrokerage,
  };
}
