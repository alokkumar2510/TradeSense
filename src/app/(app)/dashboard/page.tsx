"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Star, Activity, X } from "lucide-react";
import { useAuth }              from "@/context/AuthContext";
import { useLiveMarket }        from "@/hooks/useLiveMarket";
import { useMarketStore }       from "@/store/marketStore";
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";
import { addToWatchlist, isInWatchlist } from "@/lib/firestore/watchlist";
import { toast }                from "@/lib/toast";
import ErrorBoundary            from "@/components/ErrorBoundary";
import ConsensusEngine          from "@/components/ConsensusEngine";
import RiskEngine               from "@/components/RiskEngine";
import EmotionEngine            from "@/components/EmotionEngine";
import TradeSummary             from "@/components/TradeSummary";
import { LiveStatsCell, MomentumCell, InstitutionalCell, SignalTimelineCell } from "@/components/BottomGrid";
import styles                   from "./dashboard.module.css";
import type { Timeframe }       from "@/lib/workerApi";

const StockChart = dynamic<{ onTfChange?: (tf: Timeframe) => void }>(
  () => import("@/components/StockChart"),
  { ssr: false, loading: () => <div className={styles.chartSkeleton} /> }
);

const SUGGESTIONS = ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","WIPRO.NS","NIFTY","SENSEX"];

function fmtNum(n: number) {
  if (!n && n !== 0) return "—";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [inWL,         setInWL]         = useState(false);
  const [wBusy,        setWBusy]        = useState(false);

  const symbol      = useMarketStore(s => s.symbol);
  const quote       = useMarketStore(s => s.quote);
  const news        = useMarketStore(s => s.news);
  const error       = useMarketStore(s => s.error);
  const initialising = useMarketStore(s => s.initialising);
  const setSymbol   = useMarketStore(s => s.setSymbol);
  const setError    = useMarketStore(s => s.setError);
  const reset       = useMarketStore(s => s.reset);

  const { handleTfChange, isLoading } = useLiveMarket(symbol);
  const analytics = useComputedAnalytics();
  const loading   = initialising || isLoading;

  const fetchStock = useCallback((sym: string) => {
    if (!sym.trim()) return;
    reset(); setSymbol(sym.trim().toUpperCase());
  }, [reset, setSymbol]);

  useEffect(() => {
    if (!user || !quote) { setInWL(false); return; }
    isInWatchlist(user.uid, quote.symbol).then(setInWL).catch(() => {});
  }, [user, quote?.symbol]);

  const handleWL = async () => {
    if (!user || !quote || wBusy) return;
    setWBusy(true);
    try {
      await addToWatchlist(user.uid, quote.symbol, (quote.exchange as import("@/types").Exchange) ?? "NSE");
      setInWL(true); toast(`${quote.symbol} added to watchlist`, "success");
    } catch { toast("Failed", "error"); }
    finally { setWBusy(false); }
  };

  const pc = quote?.changePercent ?? 0;
  const priceColor = pc > 0 ? "var(--green)" : pc < 0 ? "var(--red)" : "var(--text-secondary)";
  const ChangeIcon = pc > 0 ? TrendingUp : pc < 0 ? TrendingDown : Minus;
  const hasData = !!(quote || loading);

  const conSig = analytics?.consensus?.signal;
  const sigColor: Record<string,string> = { STRONG_BUY:"var(--green)", BUY:"#00C487", HOLD:"var(--amber)", SELL:"#FF6B35", STRONG_SELL:"var(--red)" };

  return (
    <div className={styles.workspace}>

      {/* ── SYMBOL / SEARCH BAR ── */}
      <div className={styles.symbolBar}>
        <div style={{ flex: 1, display: "flex", gap: 5, alignItems: "center" }}>
          {!symbol && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: 8 }}>
              Try:
            </span>
          )}
          {!symbol && SUGGESTIONS.slice(0,4).map(s => (
            <button key={s} onClick={() => fetchStock(s)} style={{ fontSize:"0.63rem", fontFamily:"var(--font-mono)", fontWeight:600, padding:"3px 8px", border:"1px solid var(--border-subtle)", borderRadius:"var(--r-xs)", background:"var(--bg-panel)", cursor:"pointer", color:"var(--text-secondary)", transition:"all 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.color="var(--blue)"; e.currentTarget.style.borderColor="rgba(77,159,255,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.color="var(--text-secondary)"; e.currentTarget.style.borderColor="var(--border-subtle)"; }}
            >{s}</button>
          ))}
        </div>

        <div className={styles.barRight}>
          {conSig && (
            <span className={styles.signalBadge} style={{ color: sigColor[conSig] ?? "var(--text-muted)", borderColor: `${sigColor[conSig] ?? "#666"}40`, background: `${sigColor[conSig] ?? "#666"}10` }}>
              {analytics!.consensus!.label.toUpperCase()}
            </span>
          )}
          <span style={{ fontSize:"0.6rem", fontWeight:700, letterSpacing:"0.1em", color: loading ? "var(--amber)" : symbol ? "var(--green)" : "var(--text-muted)", display:"flex", alignItems:"center", gap:4 }}>
            <div className="live-dot" style={{ width:5, height:5, background: loading ? "var(--amber)" : "var(--green)" }} />
            {loading ? "LOADING" : symbol ? "LIVE" : "READY"}
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.errorBar}>
          <AlertCircle size={12} />
          <span style={{ flex:1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex" }}><X size={12} /></button>
        </div>
      )}

      {/* ── WELCOME ── */}
      {!hasData && !error && (
        <div className={styles.welcome}>
          <div className={styles.welcomeGlow}><Activity size={30} color="var(--green)" /></div>
          <div style={{ textAlign:"center" }}>
            <h2 style={{ fontSize:"1.4rem", fontWeight:800, letterSpacing:"-0.025em", marginBottom:8 }}>Trading Intelligence Terminal</h2>
            <p style={{ color:"var(--text-muted)", fontSize:"0.82rem", maxWidth:460, lineHeight:1.65 }}>
              Load any NSE/BSE symbol to activate the full intelligence suite — live OHLCV analysis, consensus engine, risk scanner, momentum detector, and institutional flow tracker.
            </p>
          </div>
          <div className={styles.chips}>
            {SUGGESTIONS.map(s => <button key={s} className={styles.chip} onClick={() => fetchStock(s)}>{s}</button>)}
          </div>
        </div>
      )}

      {/* ── MAIN TERMINAL ── */}
      {hasData && (
        <div className={styles.terminal}>

          {/* LEFT — chart column */}
          <div className={styles.chartCol}>

            {/* Quote bar */}
            {quote && (
              <div className={styles.quoteBar}>
                <div className={styles.qbLeft}>
                  <span className={styles.qbSym}>{quote.symbol}</span>
                  <span className={styles.qbName}>{quote.name}</span>
                </div>
                <span className={styles.qbPrice} style={{ color:priceColor }}>
                  ₹{quote.price.toLocaleString("en-IN",{ minimumFractionDigits:2 })}
                </span>
                <span className={styles.qbChange} style={{ color:priceColor }}>
                  <ChangeIcon size={12} />
                  {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)} ({pc >= 0 ? "+" : ""}{pc.toFixed(2)}%)
                </span>
                <div className={styles.qbStats}>
                  {[
                    { l:"OPEN",    v:`₹${quote.open?.toFixed(2)??"—"}` },
                    { l:"HIGH",    v:`₹${quote.high?.toFixed(2)??"—"}`, c:"var(--green)" },
                    { l:"LOW",     v:`₹${quote.low?.toFixed(2)??"—"}`,  c:"var(--red)" },
                    { l:"VOL",     v:fmtNum(quote.volume) },
                    { l:"MKT CAP", v:fmtNum(quote.marketCap) },
                    { l:"P/E",     v:quote.pe ? quote.pe.toFixed(1) : "—" },
                  ].map(s => (
                    <div key={s.l} className={styles.qbStat}>
                      <span className={styles.qbStatL}>{s.l}</span>
                      <span className={styles.qbStatV} style={s.c ? { color:s.c } : {}}>{s.v}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.qbActions}>
                  {user && (
                    <button onClick={handleWL} disabled={wBusy || inWL} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4, color: inWL ? "var(--amber)" : "var(--text-muted)", transition:"color 0.15s" }}
                      onMouseEnter={e => { if (!inWL) e.currentTarget.style.color="var(--amber)"; }}
                      onMouseLeave={e => { if (!inWL) e.currentTarget.style.color="var(--text-muted)"; }}
                    >
                      <Star size={14} fill={inWL ? "var(--amber)" : "none"} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chart */}
            <div className={styles.chartRegion}>
              <div className={styles.chartWrap}>
                <ErrorBoundary><StockChart onTfChange={handleTfChange} /></ErrorBoundary>
              </div>
            </div>

            {/* Bottom analytics strip */}
            <div className={styles.analyticsStrip}>
              <ErrorBoundary><LiveStatsCell /></ErrorBoundary>
              <ErrorBoundary><MomentumCell /></ErrorBoundary>
              <ErrorBoundary><InstitutionalCell /></ErrorBoundary>
              <ErrorBoundary><SignalTimelineCell /></ErrorBoundary>
            </div>
          </div>

          {/* RIGHT — sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sideSection}><ErrorBoundary><ConsensusEngine /></ErrorBoundary></div>
            <div className={styles.sideSection}><ErrorBoundary><RiskEngine currentPrice={quote?.price} /></ErrorBoundary></div>
            <div className={styles.sideSection}><ErrorBoundary><EmotionEngine /></ErrorBoundary></div>
            <div className={styles.sideSection}><ErrorBoundary><TradeSummary /></ErrorBoundary></div>

            {/* Compact news feed */}
            {news.length > 0 && (
              <div className={styles.sideSection}>
                <div style={{ fontSize:"0.57rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:8 }}>
                  📰 News Sentiment
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {news.slice(0, 5).map(n => {
                    const col = n.sentiment === "Positive" ? "var(--green)" : n.sentiment === "Negative" ? "var(--red)" : "var(--amber)";
                    return (
                      <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" style={{ display:"block", padding:"6px 8px", borderRadius:"var(--r-sm)", background:"var(--bg-panel)", border:`1px solid var(--border-dim)`, textDecoration:"none", transition:"border-color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-dim)")}
                      >
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                          <span style={{ fontSize:"0.55rem", fontWeight:800, color:col, letterSpacing:"0.06em" }}>{n.sentiment.toUpperCase()}</span>
                          <span style={{ fontSize:"0.55rem", color:"var(--text-muted)" }}>· {n.source}</span>
                        </div>
                        <p style={{ fontSize:"0.65rem", color:"var(--text-secondary)", lineHeight:1.4, margin:0 }}>{n.title}</p>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
