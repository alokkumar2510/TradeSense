"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMarketStore } from "@/store/marketStore";
import { listStrategies } from "@/lib/firestore/strategies";
import { runBacktest } from "@/lib/backtestEngine";
import type { BacktestResult, Trade } from "@/lib/backtestEngine";
import type { Strategy } from "@/lib/strategySchema";
import { Play, Download, ChevronDown, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const C = {
  bg: "#060d1f", surface: "#0a1628", panel: "#0d1f38",
  border: "#1e293b", accent: "#3d8eff", green: "#00ff88",
  red: "#ff3b6b", amber: "#fb923c", text: "#94a3b8",
  textHi: "#e2e8f0", mono: "'JetBrains Mono','Fira Mono',monospace",
};

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
      <div style={{ fontSize: 9, color: C.text, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color ?? C.textHi, fontFamily: C.mono, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: C.text, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* Mini SVG equity curve */
function EquityCurve({ data }: { data: { value: number }[] }) {
  const w = 760, h = 180;
  if (data.length < 2) return <div style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", color: C.text, fontSize: 11 }}>Run a backtest to see equity curve</div>;
  const vals = data.map(d => d.value);
  const min  = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const pts   = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const area  = `M0,${h} L${pts} L${w},${h} Z`;
  const isPos = vals[vals.length - 1] >= vals[0];
  const clr   = isPos ? C.green : C.red;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={clr} stopOpacity="0.3" />
          <stop offset="100%" stopColor={clr} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#eq-grad)" />
      <polyline points={pts} fill="none" stroke={clr} strokeWidth="1.5" />
    </svg>
  );
}

/* Drawdown chart */
function DrawdownChart({ data }: { data: { drawdown: number }[] }) {
  const w = 760, h = 60;
  if (data.length < 2) return null;
  const vals = data.map(d => d.drawdown);
  const min  = Math.min(...vals, -0.01), max = 0;
  const range = max - min;
  const pts   = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${((v - max) / (-range)) * h}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={C.red} strokeWidth="1" opacity="0.7" />
    </svg>
  );
}

/* Trade log row */
function TradeRow({ t, idx }: { t: Trade; idx: number }) {
  const win  = t.pnl > 0;
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? "transparent" : `${C.panel}50` }}>
      {[
        `#${t.id + 1}`,
        new Date(t.entryTime).toLocaleDateString("en-IN"),
        `₹${t.entryPrice.toFixed(2)}`,
        new Date(t.exitTime).toLocaleDateString("en-IN"),
        `₹${t.exitPrice.toFixed(2)}`,
        t.qty,
        t.exitBar - t.entryBar,
        t.exitReason.toUpperCase(),
      ].map((v, i) => (
        <td key={i} style={{ padding: "6px 10px", fontSize: 10, color: C.text, fontFamily: C.mono, whiteSpace: "nowrap" }}>{v}</td>
      ))}
      <td style={{ padding: "6px 10px", fontSize: 10, fontFamily: C.mono, color: win ? C.green : C.red, fontWeight: 700 }}>
        {win ? "+" : ""}₹{t.pnl.toFixed(0)}
      </td>
      <td style={{ padding: "6px 10px", fontSize: 10, fontFamily: C.mono, color: win ? C.green : C.red }}>
        {win ? "+" : ""}{t.pnlPct.toFixed(2)}%
      </td>
    </tr>
  );
}

export default function BacktestDashboard() {
  const { user }   = useAuth();
  const bars       = useMarketStore(s => s.history);
  const symbol     = useMarketStore(s => s.symbol);
  const [strats, setStrats]   = useState<Strategy[]>([]);
  const [selId,  setSelId]    = useState<string>("");
  const [capital, setCapital] = useState(100000);
  const [result,  setResult]  = useState<BacktestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab]         = useState<"equity"|"trades"|"metrics">("equity");

  useEffect(() => {
    if (user) listStrategies(user.uid).then(setStrats).catch(() => {});
  }, [user]);

  const run = () => {
    const strat = strats.find(s => s.id === selId);
    if (!strat || bars.length < 40) return;
    setRunning(true);
    setTimeout(() => {
      try { setResult(runBacktest(strat, bars, capital)); }
      catch { /* silent */ }
      setRunning(false);
    }, 0);
  };

  const exportCSV = () => {
    if (!result) return;
    const hdr = "ID,Entry Date,Entry Price,Exit Date,Exit Price,Qty,Hold Bars,Reason,PnL,PnL%\n";
    const rows = result.trades.map(t =>
      [t.id + 1, new Date(t.entryTime).toLocaleDateString(), t.entryPrice, new Date(t.exitTime).toLocaleDateString(), t.exitPrice, t.qty, t.exitBar - t.entryBar, t.exitReason, t.pnl.toFixed(2), t.pnlPct.toFixed(2)].join(",")
    ).join("\n");
    const blob = new Blob([hdr + rows], { type: "text/csv" });
    const a    = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `backtest_${selId}.csv`; a.click();
  };

  const m = result?.metrics;
  const TABS = ["equity","trades","metrics"] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, fontFamily: C.mono, color: C.text, overflow: "hidden" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: C.textHi }}>BACKTEST ENGINE</span>
        <div style={{ flex: 1 }} />
        {/* Strategy selector */}
        <div style={{ position: "relative" }}>
          <select value={selId} onChange={e => setSelId(e.target.value)} style={{ appearance: "none", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textHi, fontFamily: C.mono, fontSize: 11, padding: "5px 30px 5px 10px" }}>
            <option value="">— Select Strategy —</option>
            {strats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: C.text, pointerEvents: "none" }} />
        </div>
        {/* Capital */}
        <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textHi, fontFamily: C.mono, fontSize: 11, padding: "5px 10px", width: 110 }} />
        <button onClick={run} disabled={!selId || bars.length < 40 || running} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 6, background: selId ? `${C.accent}20` : C.panel, border: `1px solid ${selId ? C.accent : C.border}`, color: selId ? C.accent : C.text, fontSize: 11, cursor: selId ? "pointer" : "not-allowed" }}>
          <Play size={11} />{running ? "RUNNING…" : "RUN"}
        </button>
        {result && <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, color: C.text, fontSize: 11, cursor: "pointer" }}><Download size={11} />CSV</button>}
      </div>

      {/* ── No data banner ── */}
      {bars.length < 40 && (
        <div style={{ margin: 16, padding: "10px 14px", borderRadius: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}30`, display: "flex", gap: 8, alignItems: "center" }}>
          <AlertTriangle size={13} color={C.amber} />
          <span style={{ fontSize: 10, color: C.amber }}>Load at least 40 bars from the dashboard chart first ({bars.length} loaded for {symbol})</span>
        </div>
      )}

      {/* ── Quick metrics strip ── */}
      {m && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8, padding: "12px 16px", flexShrink: 0 }}>
          <Metric label="Net P&L" value={`₹${m.netPnl >= 0 ? "+" : ""}${m.netPnl.toFixed(0)}`} sub={`${m.netPnlPct >= 0 ? "+" : ""}${m.netPnlPct.toFixed(2)}%`} color={m.netPnl >= 0 ? C.green : C.red} />
          <Metric label="Win Rate" value={`${m.winRate.toFixed(1)}%`} sub={`${result!.trades.filter(t => t.pnl > 0).length}W / ${result!.trades.filter(t => t.pnl <= 0).length}L`} color={m.winRate >= 50 ? C.green : C.amber} />
          <Metric label="Profit Factor" value={m.profitFactor >= 999 ? "∞" : m.profitFactor.toFixed(2)} color={m.profitFactor >= 1.5 ? C.green : m.profitFactor >= 1 ? C.amber : C.red} />
          <Metric label="Expectancy" value={`₹${m.expectancy.toFixed(0)}`} sub="per trade" color={m.expectancy >= 0 ? C.green : C.red} />
          <Metric label="Max DD" value={`${m.maxDrawdown.toFixed(2)}%`} sub={`₹${m.maxDrawdownAbs.toFixed(0)}`} color={m.maxDrawdown < 10 ? C.green : m.maxDrawdown < 20 ? C.amber : C.red} />
          <Metric label="Sharpe" value={m.sharpeRatio.toFixed(2)} color={m.sharpeRatio >= 1.5 ? C.green : m.sharpeRatio >= 0.5 ? C.amber : C.red} />
          <Metric label="Avg R:R" value={m.avgRR.toFixed(2)} color={m.avgRR >= 1.5 ? C.green : C.amber} />
          <Metric label="Trades" value={String(m.totalTrades)} sub={`Brok: ₹${m.totalBrokerage.toFixed(0)}`} />
        </div>
      )}

      {/* ── Tabs ── */}
      {result && (
        <div style={{ display: "flex", gap: 4, padding: "0 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", color: tab === t ? C.accent : C.text, cursor: "pointer", fontFamily: C.mono }}>{t}</button>
          ))}
        </div>
      )}

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflow: "auto", padding: result ? 16 : 0 }}>
        {result && tab === "equity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 9, color: C.text, marginBottom: 8, letterSpacing: "0.12em" }}>EQUITY CURVE</div>
              <EquityCurve data={result.equity} />
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 9, color: C.text, marginBottom: 8, letterSpacing: "0.12em" }}>DRAWDOWN</div>
              <DrawdownChart data={result.equity} />
            </div>
          </div>
        )}

        {result && tab === "trades" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["#","Entry","E.Price","Exit","X.Price","Qty","Bars","Reason","P&L ₹","P&L %"].map(h => (
                  <th key={h} style={{ padding: "6px 10px", fontSize: 9, color: C.text, textAlign: "left", letterSpacing: "0.1em", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.trades.map((t, i) => <TradeRow key={t.id} t={t} idx={i} />)}
            </tbody>
          </table>
        )}

        {result && tab === "metrics" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              ["Total Trades",    m!.totalTrades],
              ["Win Rate",        `${m!.winRate.toFixed(2)}%`],
              ["Profit Factor",   m!.profitFactor >= 999 ? "∞" : m!.profitFactor.toFixed(3)],
              ["Expectancy",      `₹${m!.expectancy.toFixed(2)}`],
              ["Net P&L",         `₹${m!.netPnl.toFixed(2)}`],
              ["Net P&L %",       `${m!.netPnlPct.toFixed(2)}%`],
              ["Max Drawdown",    `${m!.maxDrawdown.toFixed(2)}%`],
              ["Max DD Abs",      `₹${m!.maxDrawdownAbs.toFixed(2)}`],
              ["Sharpe Ratio",    m!.sharpeRatio.toFixed(3)],
              ["Avg R:R",         m!.avgRR.toFixed(3)],
              ["Avg Win",         `₹${m!.avgWin.toFixed(2)}`],
              ["Avg Loss",        `₹${m!.avgLoss.toFixed(2)}`],
              ["Best Trade",      `₹${m!.bestTrade.toFixed(2)}`],
              ["Worst Trade",     `₹${m!.worstTrade.toFixed(2)}`],
              ["Avg Hold (bars)", m!.avgHoldBars.toFixed(1)],
              ["Total Brokerage", `₹${m!.totalBrokerage.toFixed(2)}`],
              ["Slippage",        `${result!.config.slippagePct.toFixed(3)}%`],
              ["Capital",         `₹${result!.config.capital.toLocaleString("en-IN")}`],
            ].map(([label, value]) => (
              <Metric key={label as string} label={label as string} value={String(value)} />
            ))}
          </div>
        )}

        {!result && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: C.text }}>
            <TrendingUp size={48} color={C.border} />
            <span style={{ fontSize: 12 }}>Select a strategy and click RUN to simulate</span>
          </div>
        )}
      </div>
    </div>
  );
}
