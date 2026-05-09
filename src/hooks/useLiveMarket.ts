"use client";

/**
 * useLiveMarket — drives ALL live data for the active symbol.
 *
 * Quote:    polls every 5 s  → setQuote()
 * History:  polls every 90 s → setHistory()
 * Analysis: polls every 2 min → setAnalysis()
 * News:     polls every 5 min → setNews()
 *
 * NOTE: React Query v5 removed onSuccess/onError from useQuery.
 *       All store updates are done via useEffect watchers on query.data.
 */

import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMarketStore } from "@/store/marketStore";
import { workerApi } from "@/lib/workerApi";
import type { StockQuote, OHLCVBar, AnalysisResult, NewsItem } from "@/types";
import type { Timeframe } from "@/lib/workerApi";

// ─── Quote (5 s polling) ──────────────────────────────────────────────────────
export function useQuotePolling(symbol: string) {
  const setQuote   = useMarketStore(s => s.setQuote);
  const tickCandle = useMarketStore(s => s.tickCandle);
  const setError   = useMarketStore(s => s.setError);

  const query = useQuery({
    queryKey:        ["quote", symbol],
    queryFn:         async () => {
      const res = await workerApi.quote(symbol);
      if (!res.ok) throw new Error(res.error ?? "Quote failed");
      return res.data as StockQuote;
    },
    enabled:         !!symbol,
    refetchInterval: 5_000,
    retry:           2,
  });

  // v5-compatible: watch data changes and push to store
  const historyRef = useRef<OHLCVBar[]>([]);
  useEffect(() => {
    historyRef.current = useMarketStore.getState().history;
  });

  useEffect(() => {
    if (!query.data) return;
    const q = query.data;
    setQuote(q);
    setError(null);
    // Live tick candle from today's OHLC
    const hist = useMarketStore.getState().history;
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      tickCandle({
        time:   last.time,
        open:   last.open,
        high:   Math.max(last.high, q.high ?? q.price),
        low:    Math.min(last.low,  q.low  ?? q.price),
        close:  q.price,
        volume: q.volume ?? last.volume,
      });
    }
  }, [query.data, setQuote, tickCandle, setError]);

  useEffect(() => {
    if (query.error) setError((query.error as Error).message);
  }, [query.error, setError]);

  return query;
}

// ─── History (90 s polling, reset on TF change) ───────────────────────────────
export function useHistoryPolling(symbol: string, tf: Timeframe) {
  const setHistory        = useMarketStore(s => s.setHistory);
  const setHistoryLoading = useMarketStore(s => s.setHistoryLoading);

  const query = useQuery({
    queryKey:        ["history", symbol, tf],
    queryFn:         async () => {
      setHistoryLoading(true);
      const res = await workerApi.history(symbol, tf);
      if (!res.ok) throw new Error("History fetch failed");
      return res.data as OHLCVBar[];
    },
    enabled:         !!symbol,
    staleTime:       60_000,
    refetchInterval: 90_000,
    retry:           1,
  });

  useEffect(() => {
    if (query.data) setHistory(query.data, tf);
  }, [query.data, tf, setHistory]);

  useEffect(() => {
    if (!query.isPending) setHistoryLoading(false);
  }, [query.isPending, setHistoryLoading]);

  return query;
}

// ─── Analysis (2 min polling) ─────────────────────────────────────────────────
export function useAnalysisPolling(symbol: string) {
  const setAnalysis = useMarketStore(s => s.setAnalysis);

  const query = useQuery({
    queryKey:        ["analysis", symbol],
    queryFn:         async () => {
      const res = await workerApi.analysis(symbol);
      if (!res.ok) throw new Error("Analysis failed");
      return res.data as AnalysisResult;
    },
    enabled:         !!symbol,
    staleTime:       90_000,
    refetchInterval: 120_000,
    retry:           1,
  });

  useEffect(() => {
    if (query.data) setAnalysis(query.data);
  }, [query.data, setAnalysis]);

  return query;
}

// ─── News (5 min polling) ─────────────────────────────────────────────────────
export function useNewsPolling(symbol: string) {
  const setNews = useMarketStore(s => s.setNews);

  const query = useQuery({
    queryKey:        ["news", symbol],
    queryFn:         async () => {
      const res = await workerApi.news(symbol);
      if (!res.ok) throw new Error("News failed");
      return res.data as NewsItem[];
    },
    enabled:         !!symbol,
    staleTime:       240_000,
    refetchInterval: 300_000,
    retry:           1,
  });

  useEffect(() => {
    if (query.data) setNews(query.data);
  }, [query.data, setNews]);

  return query;
}

// ─── Finnhub WebSocket (Real-time live trades) ───────────────────────────────
export function useFinnhubWebsocket(symbol: string) {
  useEffect(() => {
    if (!symbol) return;
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      console.warn("Finnhub API key missing, live WS disabled.");
      return;
    }

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "subscribe", symbol }));
    });

    ws.addEventListener("message", (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "trade" && msg.data?.length > 0) {
          const lastTrade = msg.data[msg.data.length - 1];
          const state = useMarketStore.getState();
          const q = state.quote;
          const hist = state.history;

          if (q) state.setQuote({ ...q, price: lastTrade.p });

          if (hist.length > 0) {
            const last = hist[hist.length - 1];
            state.tickCandle({
              time:   last.time,
              open:   last.open,
              high:   Math.max(last.high, lastTrade.p),
              low:    Math.min(last.low,  lastTrade.p),
              close:  lastTrade.p,
              volume: last.volume + lastTrade.v,
            });
          }
        }
      } catch { /* ignore parse errors */ }
    });

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unsubscribe", symbol }));
      }
      ws.close();
    };
  }, [symbol]);
}

// ─── Master hook — call once in DashboardPage ─────────────────────────────────
export function useLiveMarket(symbol: string) {
  const timeframe         = useMarketStore(s => s.timeframe);
  const setInitialising   = useMarketStore(s => s.setInitialising);
  const setTimeframe      = useMarketStore(s => s.setTimeframe);
  const setHistoryLoading = useMarketStore(s => s.setHistoryLoading);
  const reset             = useMarketStore(s => s.reset);
  const prevSymbol        = useRef("");

  // Reset store on symbol change — reset() atomically sets initialising:true
  // so hasData never drops to false between the reset and the first quote.
  useEffect(() => {
    if (prevSymbol.current !== symbol && symbol) {
      reset();
      prevSymbol.current = symbol;
    }
  }, [symbol, reset]);

  const quoteQ    = useQuotePolling(symbol);
  const historyQ  = useHistoryPolling(symbol, timeframe);
  const analysisQ = useAnalysisPolling(symbol);
  const newsQ     = useNewsPolling(symbol);

  useFinnhubWebsocket(symbol);

  // Mark initialising done once first quote AND history arrive
  useEffect(() => {
    if (quoteQ.isSuccess && historyQ.isSuccess) setInitialising(false);
  }, [quoteQ.isSuccess, historyQ.isSuccess, setInitialising]);

  const handleTfChange = useCallback((tf: Timeframe) => {
    setTimeframe(tf);
    setHistoryLoading(true);
  }, [setTimeframe, setHistoryLoading]);

  return {
    isLoading: quoteQ.isLoading || historyQ.isLoading,
    isError:   quoteQ.isError,
    error:     quoteQ.error,
    handleTfChange,
  };
}
