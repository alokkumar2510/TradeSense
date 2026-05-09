"use client";
import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import {
  createChart, CandlestickSeries, HistogramSeries, LineSeries,
  ColorType, CrosshairMode,
  type IChartApi, type ISeriesApi, type UTCTimestamp,
} from "lightweight-charts";
import { useMarketStore } from "@/store/marketStore";
import { ema } from "@/lib/chartIndicators";
import {
  replayReducer, initialReplayState,
  SPEEDS, speedToMs,
} from "@/lib/replayEngine";
import { buildSnapshot, evalGroup } from "@/lib/strategyParser";
import { listStrategies } from "@/lib/firestore/strategies";
import { useAuth } from "@/context/AuthContext";
import type { Strategy } from "@/lib/strategySchema";
import {
  Play, Pause, SkipForward, RotateCcw,
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight,
} from "lucide-react";

const C = {
  bg: "#060d1f", surface: "#0a1628", panel: "#0d1f38",
  border: "#1e293b", accent: "#3d8eff", green: "#00ff88",
  red: "#ff3b6b", amber: "#fb923c", text: "#94a3b8",
  textHi: "#e2e8f0", mono: "'JetBrains Mono','Fira Mono',monospace",
};

const btn = (active = false, color = C.accent): React.CSSProperties => ({
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "5px 10px", borderRadius: 6, cursor: "pointer",
  fontFamily: C.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
  background: active ? `${color}20` : C.panel,
  border: `1px solid ${active ? color : C.border}`,
  color: active ? color : C.text, transition: "all 0.12s",
});

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: "5px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, flexShrink: 0 }}>
      <div style={{ fontSize: 8, color: C.text, letterSpacing: "0.12em" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, fontFamily: C.mono, color: color ?? C.textHi, marginTop: 1 }}>{value}</div>
    </div>
  );
}

const fmtDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });

export default function ReplayPlayer() {
  const { user }    = useAuth();
  const fullHistory = useMarketStore(s => s.history);
  const symbol      = useMarketStore(s => s.symbol);

  const [state, dispatch] = useReducer(replayReducer, initialReplayState);
  const { bars, cursor, playing, speed, trades, openPos, realised, capital } = state;

  const [strats,      setStrats]      = useState<Strategy[]>([]);
  const [selStrat,    setSelStrat]    = useState("");
  const [showSig,     setShowSig]     = useState(true);
  const [entrySignal, setEntrySignal] = useState(false);
  const [exitSignal,  setExitSignal]  = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const candleRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef       = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ema9Ref      = useRef<ISeriesApi<"Line"> | null>(null);
  const ema21Ref     = useRef<ISeriesApi<"Line"> | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* load strategies */
  useEffect(() => {
    if (user) listStrategies(user.uid).then(setStrats).catch(() => {});
  }, [user]);

  /* load bars from store into replay state */
  useEffect(() => {
    if (fullHistory.length >= 40) dispatch({ type: "LOAD", bars: fullHistory });
  }, [fullHistory]);

  /* init chart once */
  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#6B7280", fontSize: 10 },
      grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.07)" },
      timeScale: { borderColor: "rgba(255,255,255,0.07)", timeVisible: true },
      handleScroll: true, handleScale: true,
    });
    chartRef.current  = chart;
    candleRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#00FFA3", downColor: "#EF4444",
      borderUpColor: "#00FFA3", borderDownColor: "#EF4444",
      wickUpColor: "#00FFA3", wickDownColor: "#EF4444",
    });
    volRef.current = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "vol" });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    ema9Ref.current  = chart.addSeries(LineSeries, { color: "#F59E0B", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    ema21Ref.current = chart.addSeries(LineSeries, { color: "#3B82F6", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    });
    ro.observe(containerRef.current);
    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; };
  }, []);

  /* update chart on cursor change */
  useEffect(() => {
    if (!candleRef.current || !bars.length) return;
    const visible = bars.slice(0, cursor + 1);

    candleRef.current.setData(visible.map(b => ({
      time: b.time as UTCTimestamp, open: b.open, high: b.high, low: b.low, close: b.close,
    })));
    volRef.current?.setData(visible.map(b => ({
      time: b.time as UTCTimestamp, value: b.volume,
      color: b.close >= b.open ? "rgba(0,255,163,0.35)" : "rgba(239,68,68,0.35)",
    })));
    const e9 = ema(visible, 9), e21 = ema(visible, 21);
    ema9Ref.current?.setData(e9);
    ema21Ref.current?.setData(e21);
    chartRef.current?.timeScale().scrollToPosition(0, false);

    if (showSig && selStrat) {
      const strat = strats.find(s => s.id === selStrat);
      const snap  = strat ? buildSnapshot(visible) : null;
      if (snap && strat) {
        setEntrySignal(evalGroup(strat.entry, snap));
        setExitSignal(evalGroup(strat.exit,  snap));
      }
    }
  }, [cursor, bars, selStrat, showSig, strats]);

  /* playback timer */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!playing) return;
    timerRef.current = setInterval(() => dispatch({ type: "STEP", n: 1 }), speedToMs(speed));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, speed]);

  const placeTrade = useCallback((side: "BUY" | "SELL") => {
    if (!bars.length) return;
    dispatch({ type: "TRADE", side, barIdx: cursor, price: bars[cursor].close });
  }, [bars, cursor]);

  const bar      = bars[cursor];
  const progress = bars.length > 1 ? cursor / (bars.length - 1) : 0;
  const unrealPnl = openPos && bar ? (bar.close - openPos.price) * openPos.qty : 0;
  const totalPnl  = realised + unrealPnl;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, fontFamily: C.mono, color: C.text, overflow: "hidden" }}>

      {/* ── Header info bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.textHi, letterSpacing: "0.1em" }}>{symbol || "—"}</span>
        {bar && <span style={{ fontSize: 10, color: C.text }}>{fmtDate(bar.time as number)}</span>}
        {bar && <span style={{ fontSize: 12, fontWeight: 700, color: bar.close >= bar.open ? C.green : C.red }}>₹{bar.close.toFixed(2)}</span>}
        <div style={{ flex: 1 }} />
        <select value={selStrat} onChange={e => setSelStrat(e.target.value)} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 5, color: C.textHi, fontFamily: C.mono, fontSize: 10, padding: "4px 8px" }}>
          <option value="">No strategy overlay</option>
          {strats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {selStrat && showSig && entrySignal && <span style={{ padding: "3px 8px", borderRadius: 4, background: `${C.green}20`, border: `1px solid ${C.green}50`, color: C.green, fontSize: 9, fontWeight: 800 }}>▲ ENTRY</span>}
        {selStrat && showSig && exitSignal  && <span style={{ padding: "3px 8px", borderRadius: 4, background: `${C.red}20`,   border: `1px solid ${C.red}50`,   color: C.red,   fontSize: 9, fontWeight: 800 }}>▼ EXIT</span>}
        <button onClick={() => setShowSig(v => !v)} style={btn(showSig, C.amber)}>SIG</button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "flex", gap: 8, padding: "8px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, overflowX: "auto" }}>
        <Stat label="CANDLE"    value={`${cursor + 1}/${bars.length}`} />
        <Stat label="CAPITAL"   value={`₹${capital.toLocaleString("en-IN")}`} />
        <Stat label="POSITION"  value={openPos ? `${openPos.qty}@₹${openPos.price.toFixed(0)}` : "FLAT"} color={openPos ? C.amber : C.text} />
        <Stat label="UNREAL"    value={openPos ? `${unrealPnl >= 0 ? "+" : ""}₹${unrealPnl.toFixed(0)}` : "—"} color={unrealPnl >= 0 ? C.green : C.red} />
        <Stat label="REALISED"  value={`${realised >= 0 ? "+" : ""}₹${realised.toFixed(0)}`}  color={realised >= 0 ? C.green : C.red} />
        <Stat label="TOTAL P&L" value={`${totalPnl >= 0 ? "+" : ""}₹${totalPnl.toFixed(0)}`} color={totalPnl >= 0 ? C.green : C.red} />
        <Stat label="TRADES"    value={String(trades.length)} />
      </div>

      {/* ── Chart area ── */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        {!bars.length && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <TrendingUp size={40} color={C.border} />
            <span style={{ fontSize: 11, color: C.text }}>Load chart data from Dashboard first (need ≥40 bars)</span>
          </div>
        )}
      </div>

      {/* ── Scrubber ── */}
      {bars.length > 0 && (
        <div style={{ padding: "6px 14px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, color: C.text }}>
            <span style={{ flexShrink: 0 }}>{bars[0] ? fmtDate(bars[0].time as number) : ""}</span>
            <div
              style={{ flex: 1, position: "relative", height: 6, background: C.panel, borderRadius: 3, cursor: "pointer" }}
              onClick={e => {
                const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                dispatch({ type: "SEEK", pct: (e.clientX - r.left) / r.width });
              }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress * 100}%`, background: C.accent, borderRadius: 3, transition: "width 0.08s linear" }} />
              {trades.map((t, i) => (
                <div key={i} style={{ position: "absolute", top: -1, height: 8, width: 2, borderRadius: 1,
                  left: `${(t.barIdx / Math.max(bars.length - 1, 1)) * 100}%`,
                  background: t.side === "BUY" ? C.green : C.red,
                }} />
              ))}
            </div>
            <span style={{ flexShrink: 0 }}>{bar ? fmtDate(bar.time as number) : ""}</span>
          </div>
        </div>
      )}

      {/* ── Playback controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderTop: `1px solid ${C.border}`, flexShrink: 0, flexWrap: "wrap" }}>
        <button onClick={() => dispatch({ type: "STEP", n: -1 })}  style={btn()}><ChevronLeft size={12} /></button>
        <button onClick={() => dispatch({ type: playing ? "PAUSE" : "PLAY" })} disabled={!bars.length} style={{ ...btn(playing, C.green), padding: "5px 18px", gap: 5 }}>
          {playing ? <><Pause size={12} />PAUSE</> : <><Play size={12} />PLAY</>}
        </button>
        <button onClick={() => dispatch({ type: "STEP", n: 1 })}   style={btn()}><ChevronRight size={12} /></button>
        <button onClick={() => dispatch({ type: "STEP", n: 10 })}  style={btn()}><SkipForward size={12} /><span style={{ marginLeft: 3 }}>+10</span></button>
        <button onClick={() => dispatch({ type: "RESET" })}        style={btn(false, C.amber)}><RotateCcw size={11} /></button>

        <div style={{ width: 1, height: 20, background: C.border }} />
        <span style={{ fontSize: 9, color: C.text }}>SPEED</span>
        {SPEEDS.map(s => (
          <button key={s} onClick={() => dispatch({ type: "SPEED", speed: s })} style={btn(speed === s)}>{s}×</button>
        ))}

        <div style={{ width: 1, height: 20, background: C.border }} />
        <button onClick={() => placeTrade("BUY")}  disabled={!!openPos || !bars.length} style={{ ...btn(!openPos && bars.length > 0, C.green),  padding: "5px 14px", gap: 4 }}><TrendingUp  size={11} />BUY</button>
        <button onClick={() => placeTrade("SELL")} disabled={!openPos  || !bars.length} style={{ ...btn(!!openPos,  C.red),   padding: "5px 14px", gap: 4 }}><TrendingDown size={11} />SELL</button>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: C.text }}>{(progress * 100).toFixed(1)}%</span>
      </div>

      {/* ── Mini trade log ── */}
      {trades.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}`, maxHeight: 110, overflowY: "auto", flexShrink: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["#","Side","Date","Price"].map(h => <th key={h} style={{ padding: "4px 10px", fontSize: 8, color: C.text, textAlign: "left", letterSpacing: "0.1em" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "4px 10px", fontSize: 9, color: C.text }}>{i + 1}</td>
                  <td style={{ padding: "4px 10px", fontSize: 9, fontWeight: 700, color: t.side === "BUY" ? C.green : C.red }}>{t.side}</td>
                  <td style={{ padding: "4px 10px", fontSize: 9, color: C.text }}>{fmtDate(bars[t.barIdx]?.time as number)}</td>
                  <td style={{ padding: "4px 10px", fontSize: 9, color: C.textHi, fontFamily: C.mono }}>₹{t.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
