import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { StockQuote, OHLCVBar, AnalysisResult, NewsItem } from "@/types";
import type { Timeframe } from "@/lib/workerApi";

export interface MarketState {
  // ─── Symbol ───────────────────────────────────────────────────
  symbol:        string;
  setSymbol:     (s: string) => void;

  // ─── Quote (updates every 5 s) ────────────────────────────────
  quote:         StockQuote | null;
  quoteAt:       number;                       // epoch ms of last update
  setQuote:      (q: StockQuote) => void;

  // ─── History / chart data ────────────────────────────────────
  history:       OHLCVBar[];
  timeframe:     Timeframe;
  historyAt:     number;
  setHistory:    (bars: OHLCVBar[], tf: Timeframe) => void;
  /** Append-or-update the LAST candle (live tick) */
  tickCandle:    (bar: OHLCVBar) => void;
  setTimeframe:  (tf: Timeframe) => void;

  // ─── Analytics ───────────────────────────────────────────────
  analysis:      AnalysisResult | null;
  analysisAt:    number;
  setAnalysis:   (a: AnalysisResult) => void;

  // ─── News ───────────────────────────────────────────────────
  news:          NewsItem[];
  setNews:       (n: NewsItem[]) => void;

  // ─── Loading / error ─────────────────────────────────────────
  initialising:  boolean;               // first full load
  historyLoading: boolean;
  error:         string | null;
  setInitialising:  (v: boolean) => void;
  setHistoryLoading: (v: boolean) => void;
  setError:      (e: string | null) => void;

  // ─── Reset when symbol changes ────────────────────────────────
  reset:         () => void;
}

const BLANK: Omit<MarketState, "setSymbol"|"setQuote"|"setHistory"|"tickCandle"|"setTimeframe"
  |"setAnalysis"|"setNews"|"setInitialising"|"setHistoryLoading"|"setError"|"reset"|"symbol"> = {
  quote:          null,
  quoteAt:        0,
  history:        [],
  timeframe:      "6M",
  historyAt:      0,
  analysis:       null,
  analysisAt:     0,
  news:           [],
  initialising:   true,   // always true on reset — avoids the blank-frame flash
  historyLoading: false,
  error:          null,
};

export const useMarketStore = create<MarketState>()(
  subscribeWithSelector((set, get) => ({
    symbol:    "",
    ...BLANK,

    setSymbol: (s) => set({ symbol: s }),

    setQuote: (q) => set({ quote: q, quoteAt: Date.now(), error: null }),

    setHistory: (bars, tf) =>
      set({ history: bars, timeframe: tf, historyAt: Date.now(), historyLoading: false }),

    tickCandle: (bar) => {
      const hist = get().history;
      if (!hist.length) return;
      const last = hist[hist.length - 1];
      // Same candle period → update in place; otherwise append
      if (last.time === bar.time) {
        set({ history: [...hist.slice(0, -1), bar] });
      } else {
        set({ history: [...hist, bar] });
      }
    },

    setTimeframe: (tf) => set({ timeframe: tf }),

    setAnalysis: (a) => set({ analysis: a, analysisAt: Date.now() }),

    setNews: (n) => set({ news: n }),

    setInitialising:  (v) => set({ initialising: v }),
    setHistoryLoading: (v) => set({ historyLoading: v }),
    setError:         (e) => set({ error: e }),

    // Reset all transient data but keep initialising:true (from BLANK)
    // so hasData stays truthy until the first quote arrives — prevents the
    // dashboard terminal from unmounting mid-session.
    reset: () => set({ ...BLANK, initialising: true }),
  }))
);
