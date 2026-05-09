"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { StockQuote, OHLCVBar, Signal, NewsItem, AnalysisResult } from "@/types";
import { workerApi, type Timeframe } from "@/lib/workerApi";

const POLL_INTERVAL_MS = 60_000;

interface StockData {
  quote:     StockQuote | null;
  history:   OHLCVBar[];
  signal:    Signal | null;
  news:      NewsItem[];
  analysis:  AnalysisResult | null;
  timeframe: Timeframe;
}

interface UseStockReturn extends StockData {
  loading:       boolean;
  historyLoading: boolean;
  error:         string | null;
  fetchStock:    (symbol: string) => Promise<void>;
  setTimeframe:  (tf: Timeframe) => Promise<void>;
  clearError:    () => void;
}

export function useStock(): UseStockReturn {
  const [data, setData]               = useState<StockData>({ quote: null, history: [], signal: null, news: [], analysis: null, timeframe: "6M" });
  const [loading, setLoading]         = useState(false);
  const [historyLoading, setHLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const symbolRef                     = useRef<string>("");
  const pollRef                       = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStock = useCallback(async (symbol: string) => {
    if (!symbol.trim()) return;
    symbolRef.current = symbol;

    if (pollRef.current) clearInterval(pollRef.current);
    setLoading(true);
    setError(null);

    try {
      const [quoteRes, historyRes, newsRes, analysisRes] = await Promise.all([
        workerApi.quote(symbol),
        workerApi.history(symbol, "6M"),   // default TF on first load
        workerApi.news(symbol),
        workerApi.analysis(symbol),
      ]);

      if (!quoteRes.ok) {
        setError(quoteRes.code === "NOT_FOUND" ? `Symbol "${symbol}" not found` : quoteRes.error);
        setData(prev => ({ ...prev, quote: null, history: [], analysis: null, news: [] }));
        return;
      }

      setData({
        quote:     quoteRes.ok    ? (quoteRes.data    as StockQuote)    : null,
        history:   historyRes.ok  ? (historyRes.data  as OHLCVBar[])    : [],
        signal:    null,
        news:      newsRes.ok     ? (newsRes.data      as NewsItem[])    : [],
        analysis:  analysisRes.ok ? (analysisRes.data  as AnalysisResult): null,
        timeframe: "6M",
      });

      // 60s quote poll
      pollRef.current = setInterval(async () => {
        const r = await workerApi.quote(symbolRef.current);
        if (r.ok) setData(prev => ({ ...prev, quote: r.data as StockQuote }));
      }, POLL_INTERVAL_MS);

    } catch {
      setError("Failed to load stock data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Switch timeframe — only refetches history, keeps quote/analysis */
  const setTimeframe = useCallback(async (tf: Timeframe) => {
    if (!symbolRef.current) return;
    setHLoading(true);
    setData(prev => ({ ...prev, timeframe: tf }));
    try {
      const res = await workerApi.history(symbolRef.current, tf);
      if (res.ok) setData(prev => ({ ...prev, history: res.data as OHLCVBar[], timeframe: tf }));
    } catch {
      // keep existing history on failure
    } finally {
      setHLoading(false);
    }
  }, []);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const clearError = useCallback(() => setError(null), []);

  return { ...data, loading, historyLoading, error, fetchStock, setTimeframe, clearError };
}
