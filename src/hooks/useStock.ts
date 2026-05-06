"use client";

import { useState, useCallback, useRef } from "react";
import type { StockQuote, OHLCVBar, Signal, NewsItem } from "@/types";
import { workerApi } from "@/lib/workerApi";

interface StockData {
  quote:   StockQuote | null;
  history: OHLCVBar[];
  signal:  Signal | null;
  news:    NewsItem[];
}

interface UseStockReturn extends StockData {
  loading:   boolean;
  error:     string | null;
  fetchStock: (symbol: string) => Promise<void>;
  clearError: () => void;
}

export function useStock(): UseStockReturn {
  const [data, setData]     = useState<StockData>({ quote: null, history: [], signal: null, news: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const abortRef            = useRef<AbortController | null>(null);

  const fetchStock = useCallback(async (symbol: string) => {
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch of all data in one go
      const [quoteRes, historyRes, signalRes, newsRes] = await Promise.all([
        workerApi.quote(symbol),
        workerApi.history(symbol),
        workerApi.signal(symbol),
        workerApi.news(symbol),
      ]);

      if (!quoteRes.ok) {
        setError(quoteRes.code === "NOT_FOUND" ? `Symbol "${symbol}" not found` : quoteRes.error);
        setData({ quote: null, history: [], signal: null, news: [] });
        return;
      }

      setData({
        quote:   quoteRes.ok   ? (quoteRes.data as StockQuote) : null,
        history: historyRes.ok ? (historyRes.data as OHLCVBar[]) : [],
        signal:  signalRes.ok  ? (signalRes.data as { signal: Signal }).signal : null,
        news:    newsRes.ok    ? (newsRes.data as NewsItem[]) : [],
      });
    } catch {
      setError("Failed to load stock data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { ...data, loading, error, fetchStock, clearError };
}
