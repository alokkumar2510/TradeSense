"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWatchlist, removeFromWatchlist } from "@/lib/firestore/watchlist";
import { workerApi } from "@/lib/workerApi";
import { Star, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { WatchlistItem, StockQuote } from "@/types";
import styles from "./watchlist.module.css";
import { formatINR } from "@/lib/profitEngine";

export default function WatchlistPage() {
  const { user }          = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const wl = await getWatchlist(user.uid);
      setItems(wl);
      setLoading(false);
      // Fetch live prices in parallel
      const quoteResults = await Promise.allSettled(
        wl.map((w) => workerApi.quote(w.symbol))
      );
      const qMap: Record<string, StockQuote> = {};
      quoteResults.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.ok) {
          qMap[wl[i].symbol] = r.value.data as StockQuote;
        }
      });
      setQuotes(qMap);
    })();
  }, [user]);

  const handleRemove = async (symbol: string) => {
    if (!user) return;
    await removeFromWatchlist(user.uid, symbol);
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));
  };

  return (
    <div className="container animate-fadeUp">
      <div className={styles.header}>
        <div>
          <h1>Watchlist</h1>
          <p>Your saved stocks — add from the Dashboard</p>
        </div>
      </div>

      {loading ? (
        <div>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 8, borderRadius: 12 }} />)}</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <Star size={48} color="var(--text-muted)" />
          <h3>Watchlist is empty</h3>
          <p>Search a stock on the dashboard and click ★ to add it here.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => {
            const q   = quotes[item.symbol];
            const chg = q?.changePercent ?? 0;
            return (
              <div key={item.symbol} className={styles.row}>
                <div className={styles.symbol}>
                  <strong>{item.symbol}</strong>
                  <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>{item.exchange}</span>
                </div>
                {q ? (
                  <div className={styles.price}>
                    <span className="mono">{formatINR(q.price)}</span>
                    <span className={`${styles.change} ${chg >= 0 ? "positive" : "negative"}`}>
                      {chg >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="skeleton" style={{ width: 100, height: 20 }} />
                )}
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => handleRemove(item.symbol)}
                  title="Remove from watchlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
