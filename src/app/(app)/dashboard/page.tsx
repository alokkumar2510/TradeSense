"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Search, TrendingUp, TrendingDown, Minus,
  AlertCircle, RefreshCw, Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStock } from "@/hooks/useStock";
import { addToWatchlist, isInWatchlist } from "@/lib/firestore/watchlist";
import { toast } from "@/lib/toast";
import SignalCard from "@/components/SignalCard";
import NewsFeed from "@/components/NewsFeed";
import StockStats from "@/components/StockStats";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { StockQuote, OHLCVBar } from "@/types";
import { workerApi } from "@/lib/workerApi";
import styles from "./dashboard.module.css";

// Lazy-load heavy chart — never SSR
const StockChart = dynamic<{ data: OHLCVBar[]; symbol?: string; loading?: boolean; error?: string | null }>(
  () => import("@/components/StockChart"),
  {
    ssr: false,
    loading: () => (
      <div className={styles.chartSkeleton}>
        <div className="skeleton" style={{ height: "100%" }} />
      </div>
    ),
  }
);

interface SearchResult {
  symbol: string;
  name: string;
  exchangeShortName: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // ─── Search state ─────────────────────────────────────────────────────────
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState<SearchResult[]>([]);
  const [searching,   setSearching]   = useState(false);
  const [showDropdown,setShowDropdown]= useState(false);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);

  // ─── Watchlist state ──────────────────────────────────────────────────────
  const [inWatchlist,    setInWatchlist]    = useState(false);
  const [watchlistBusy,  setWatchlistBusy]  = useState(false);

  const { quote, history, signal, news, loading, error, fetchStock, clearError } = useStock();

  // ─── Debounced autocomplete search ───────────────────────────────────────
  useEffect(() => {
    if (!query.trim() || query.length < 1) {
      setTimeout(() => {
        setResults([]);
        setShowDropdown(false);
      }, 0);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await workerApi.search(query);
      if (res.ok) setResults((res.data as SearchResult[]).slice(0, 8));
      setSearching(false);
      setShowDropdown(true);
    }, 380);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // ─── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Check watchlist membership when quote changes ────────────────────────
  useEffect(() => {
    if (!user || !quote) {
      setTimeout(() => setInWatchlist(false), 0);
      return;
    }
    isInWatchlist(user.uid, quote.symbol)
      .then(setInWatchlist)
      .catch(() => {});
  }, [user, quote]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSelect = useCallback((symbol: string) => {
    setQuery(symbol);
    setShowDropdown(false);
    fetchStock(symbol);
  }, [fetchStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchStock(query.trim().toUpperCase());
      setShowDropdown(false);
    }
  };

  const handleWatchlist = async () => {
    if (!user || !quote || watchlistBusy) return;
    setWatchlistBusy(true);
    try {
      await addToWatchlist(user.uid, quote.symbol, quote.exchange);
      setInWatchlist(true);
      toast(`${quote.symbol} added to watchlist`, "success");
    } catch {
      toast("Failed to update watchlist", "error");
    } finally {
      setWatchlistBusy(false);
    }
  };

  // ─── Derived display values ───────────────────────────────────────────────
  const priceChange = quote?.changePercent ?? 0;
  const changeColor = priceChange > 0 ? "positive" : priceChange < 0 ? "negative" : "neutral";
  const ChangeIcon  = priceChange > 0 ? TrendingUp : priceChange < 0 ? TrendingDown : Minus;

  return (
    <div className="container animate-fadeUp">

      {/* ─── Search ─────────────────────────────────────────────────────────── */}
      <div className={styles.searchSection}>
        <h1 className={styles.pageTitle}>Stock Analysis</h1>
        <p className={styles.pageSubtitle}>
          Search any NSE/BSE symbol for real-time signals
        </p>

        <div className={styles.searchWrapper} ref={dropdownRef}>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <Search size={18} className={styles.searchIcon} />
            <input
              id="stock-search-input"
              className={`input ${styles.searchInput}`}
              type="text"
              placeholder="Search symbol or company (e.g. RELIANCE, TCS)"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              autoComplete="off"
              autoFocus
            />
            <button
              id="stock-search-btn"
              type="submit"
              className={`btn btn-primary ${styles.searchBtn}`}
              disabled={loading || !query.trim()}
            >
              {loading
                ? <div className="spinner" style={{ width: 16, height: 16 }} />
                : "Analyse"}
            </button>
          </form>

          {/* Autocomplete dropdown */}
          {showDropdown && results.length > 0 && (
            <div className={styles.dropdown}>
              {results.map((r) => (
                <button
                  key={r.symbol}
                  className={styles.dropdownItem}
                  onClick={() => handleSelect(r.symbol)}
                >
                  <span className={styles.dropSymbol}>{r.symbol}</span>
                  <span className={styles.dropName}>{r.name}</span>
                  <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>
                    {r.exchangeShortName}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Searching indicator */}
          {searching && (
            <div className={styles.dropdown} style={{ padding: "0.875rem 1rem" }}>
              <div className="spinner" style={{ width: 16, height: 16 }} />
            </div>
          )}
        </div>
      </div>

      {/* ─── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={clearError} className="btn btn-ghost btn-sm btn-icon">
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* ─── Empty / welcome state ───────────────────────────────────────────── */}
      {!loading && !quote && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <TrendingUp size={40} />
          </div>
          <h2>Search a Stock to Begin</h2>
          <p>
            Enter any NSE or BSE symbol above to see real-time price,
            technical indicators, AI-generated signals, and news sentiment.
          </p>
          <div className={styles.suggestions}>
            {["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "WIPRO.NS"].map((s) => (
              <button
                key={s}
                className="btn btn-secondary btn-sm"
                onClick={() => handleSelect(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Results ─────────────────────────────────────────────────────────── */}
      {quote && (
        <>
          {/* Quote header */}
          <div className={styles.quoteHeader}>
            <div>
              <div className={styles.symbolRow}>
                <h2 className={styles.symbol}>{quote.symbol}</h2>
                <span className="badge badge-blue">{quote.exchange}</span>
                {/* Watchlist star */}
                {user && (
                  <button
                    id="watchlist-star-btn"
                    className={`btn btn-ghost btn-sm btn-icon ${styles.starBtn}`}
                    onClick={handleWatchlist}
                    disabled={watchlistBusy || inWatchlist}
                    title={inWatchlist ? "Already in watchlist" : "Add to watchlist"}
                    aria-label="Add to watchlist"
                  >
                    <Star
                      size={18}
                      fill={inWatchlist ? "var(--accent-amber)" : "none"}
                      color={inWatchlist ? "var(--accent-amber)" : "var(--text-muted)"}
                    />
                  </button>
                )}
              </div>
              <p className={styles.companyName}>{quote.name}</p>
            </div>
            <div className={styles.priceBlock}>
              <div className={styles.price}>
                ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <div className={`${styles.change} ${changeColor}`}>
                <ChangeIcon size={16} />
                {quote.change >= 0 ? "+" : ""}
                {quote.change.toFixed(2)}&nbsp;
                ({priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* Stats row */}
          <ErrorBoundary>
            <StockStats quote={quote} />
          </ErrorBoundary>

          {/* Main grid */}
          <div className="dashboard-grid" style={{ marginTop: "1.5rem" }}>

            {/* Left column — chart + news */}
            <div className="flex flex-col gap-4">
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartTitle}>Price Chart (180d)</span>
                  <span className={styles.chartPeriod}>{quote.symbol}</span>
                </div>
                <div className={styles.chartContainer}>
                  <ErrorBoundary>
                    <StockChart
                      data={history}
                      symbol={quote.symbol}
                      loading={loading}
                      error={error ?? null}
                    />
                  </ErrorBoundary>
                </div>
              </div>

              <ErrorBoundary>
                <NewsFeed news={news} />
              </ErrorBoundary>
            </div>

            {/* Right column — signal panel */}
            <div>
              <ErrorBoundary>
                <SignalCard signal={signal} loading={loading} />
              </ErrorBoundary>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
