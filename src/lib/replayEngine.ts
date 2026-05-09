import type { OHLCVBar } from "@/types";

/* ── Types ─────────────────────────────────────────────────────── */
export type ReplaySpeed = 0.5 | 1 | 2 | 5 | 10 | 20;

export interface ManualTrade {
  barIdx:    number;
  price:     number;
  side:      "BUY" | "SELL";
  timestamp: number;
}

export interface ReplayState {
  bars:      OHLCVBar[];  // full dataset
  cursor:    number;      // current visible index (inclusive)
  playing:   boolean;
  speed:     ReplaySpeed;
  trades:    ManualTrade[];
  capital:   number;
  openPos:   { price: number; qty: number } | null;
  realised:  number;      // cumulative P&L
}

export type ReplayAction =
  | { type: "LOAD";    bars: OHLCVBar[]; startPct?: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STEP";    n?: number }
  | { type: "SEEK";    pct: number }
  | { type: "SPEED";   speed: ReplaySpeed }
  | { type: "TRADE";   side: "BUY" | "SELL"; barIdx: number; price: number }
  | { type: "RESET" };

export const SPEEDS: ReplaySpeed[] = [0.5, 1, 2, 5, 10, 20];
const MIN_VISIBLE = 40; // warmup bars always shown

export function replayReducer(state: ReplayState, action: ReplayAction): ReplayState {
  switch (action.type) {
    case "LOAD": {
      const start = Math.max(MIN_VISIBLE, Math.floor((action.startPct ?? 0.1) * action.bars.length));
      return { ...state, bars: action.bars, cursor: start, playing: false, trades: [], openPos: null, realised: 0 };
    }
    case "PLAY":  return { ...state, playing: true };
    case "PAUSE": return { ...state, playing: false };
    case "STEP": {
      const n = action.n ?? 1;
      const next = Math.min(state.cursor + n, state.bars.length - 1);
      const done = next >= state.bars.length - 1;
      return { ...state, cursor: next, playing: done ? false : state.playing };
    }
    case "SEEK": {
      const idx = Math.max(MIN_VISIBLE, Math.floor(action.pct * (state.bars.length - 1)));
      return { ...state, cursor: idx, playing: false };
    }
    case "SPEED": return { ...state, speed: action.speed };
    case "TRADE": {
      const { side, barIdx, price } = action;
      const trade: ManualTrade = { barIdx, price, side, timestamp: Date.now() };
      let { openPos, realised, capital } = state;
      const qty = openPos?.qty ?? Math.floor(capital * 0.1 / price);

      if (side === "BUY" && !openPos) {
        capital -= price * qty;
        openPos = { price, qty };
      } else if (side === "SELL" && openPos) {
        const pnl = (price - openPos.price) * openPos.qty;
        realised += pnl;
        capital  += price * openPos.qty;
        openPos   = null;
      }
      return { ...state, trades: [...state.trades, trade], openPos, realised, capital };
    }
    case "RESET": return { ...state, cursor: MIN_VISIBLE, playing: false, trades: [], openPos: null, realised: 0 };
    default: return state;
  }
}

export const initialReplayState: ReplayState = {
  bars: [], cursor: MIN_VISIBLE, playing: false, speed: 1,
  trades: [], capital: 100_000, openPos: null, realised: 0,
};

/* ── Interval ms per candle ─────────────────────────────────────── */
export function speedToMs(speed: ReplaySpeed): number {
  return Math.round(1000 / speed);
}
