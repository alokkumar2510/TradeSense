"use client";
import { useMemo } from "react";
import { useMarketStore } from "@/store/marketStore";
import { computeAllEngines } from "@/lib/analyticsEngine";
import type { AnalysisResult } from "@/types";

/** Derives all 5 intelligence engines from the live OHLCV bars in the store.
 *  Recomputes automatically on every candle tick or history update. */
export function useComputedAnalytics(): Partial<AnalysisResult> | null {
  const history = useMarketStore(s => s.history);

  return useMemo(() => {
    if (!history || history.length < 20) return null;
    try {
      return computeAllEngines(history) as Partial<AnalysisResult>;
    } catch {
      return null;
    }
  }, [history]);
}
