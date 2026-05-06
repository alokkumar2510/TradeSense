"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getHoldings,
  addTransaction,
} from "@/lib/firestore/portfolio";
import type { Holding, AddTradePayload } from "@/types";


export function usePortfolio(uid: string | null) {
  const [holdings,  setHoldings]  = useState<Holding[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!uid) { setHoldings([]); setLoading(false); return; }
    try {
      setLoading(true);
      const h = await getHoldings(uid);
      setHoldings(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { setTimeout(() => { load(); }, 0); }, [load]);

  const addTrade = async (payload: AddTradePayload) => {
    if (!uid) throw new Error("Not authenticated");
    const { calculateCharges } = await import("@/lib/profitEngine");
    const charges = calculateCharges(payload.price, payload.quantity, payload.type);
    await addTransaction(uid, {
      symbol:    payload.symbol,
      exchange:  payload.exchange,
      type:      payload.type,
      quantity:  payload.quantity,
      price:     payload.price,
      date:      payload.date,
      charges,
    });
    await load();
  };

  return { holdings, loading, error, addTrade, refresh: load };
}
