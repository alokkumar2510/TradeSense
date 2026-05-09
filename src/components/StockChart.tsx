"use client";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  createChart, CandlestickSeries, AreaSeries, HistogramSeries, LineSeries,
  CrosshairMode, ColorType,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type MouseEventParams,
} from "lightweight-charts";
import { useMarketStore } from "@/store/marketStore";
import {
  ema, vwap, bollingerBands, rsiSeries, macdSeries,
  momentumSeries, stochasticSeries, supportResistanceLevels, toHeikinAshi,
} from "@/lib/chartIndicators";
import type { OHLCVBar } from "@/types";
import type { Timeframe } from "@/lib/workerApi";

const C = {
  up: "#00FFA3", down: "#EF4444",
  upA: "rgba(0,255,163,0.10)", downA: "rgba(239,68,68,0.10)",
  volUp: "rgba(0,255,163,0.38)", volDown: "rgba(239,68,68,0.38)",
  ema9: "#F59E0B", ema21: "#3B82F6", ema50: "#A855F7",
  vwap: "#F472B6",
  bb: "rgba(59,130,246,0.35)", bbMid: "rgba(59,130,246,0.6)",
  sr: { support: "rgba(0,255,163,0.5)", resistance: "rgba(239,68,68,0.5)" },
  rsiLine: "#F59E0B", macdLine: "#3B82F6", sigLine: "#F59E0B",
  momPos: "#10B981", momNeg: "#EF4444",
  stochK: "#60A5FA", stochD: "#F59E0B",
  grid: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.07)", text: "#6B7280",
};

type ChartType = "candle" | "area" | "ha";
type Overlay = "ema9" | "ema21" | "ema50" | "bb" | "vwap" | "sr";
type SubPanel = "volume" | "rsi" | "macd" | "momentum" | "stoch";

const TIMEFRAMES: Timeframe[] = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "MAX"];

function chartOpts(height: number) {
  return {
    layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: C.text, fontSize: 11 },
    grid: { vertLines: { color: C.grid }, horzLines: { color: C.grid } },
    crosshair: { mode: CrosshairMode.Normal },
    rightPriceScale: { borderColor: C.border, scaleMargins: { top: 0.08, bottom: 0.04 } },
    timeScale: { borderColor: C.border, timeVisible: true, secondsVisible: false },
    height, handleScroll: true, handleScale: true,
  } as const;
}

const BTN: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 5, color: "#6B7280", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0.5rem", letterSpacing: "0.04em", transition: "all 0.12s" };
const BTNA: React.CSSProperties = { ...BTN, background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.4)", color: "#60A5FA" };

interface Props { onTfChange?: (tf: Timeframe) => void; }

const StockChart = memo(function StockChart({ onTfChange }: Props) {
  const symbol        = useMarketStore(s => s.symbol);
  const history       = useMarketStore(s => s.history);
  const timeframe     = useMarketStore(s => s.timeframe);
  const historyLoading = useMarketStore(s => s.historyLoading);
  const initialising  = useMarketStore(s => s.initialising);
  const error         = useMarketStore(s => s.error);

  const [chartType, setChartType] = useState<ChartType>("candle");
  const [overlays, setOverlays]   = useState<Set<Overlay>>(new Set(["ema9", "ema21", "ema50", "vwap"]));
  const [subPanel, setSubPanel]   = useState<SubPanel>("volume");
  const [tooltip, setTooltip]     = useState<{ bar: OHLCVBar; x: number; y: number } | null>(null);
  const [heights, setHeights]     = useState({ main: 340, sub: 120 });

  const mainRef       = useRef<HTMLDivElement>(null);
  const subRef        = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const chartRef      = useRef<IChartApi | null>(null);
  const subChartRef   = useRef<IChartApi | null>(null);
  const mainSeries    = useRef<ISeriesApi<any> | null>(null);
  const subSeries     = useRef<ISeriesApi<any> | null>(null);
  const overlaySeries = useRef<Map<string, ISeriesApi<any>>>(new Map());
  const subExtra      = useRef<ISeriesApi<any>[]>([]);
  const prevKey       = useRef("");
  const isBuilt       = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ob = new ResizeObserver(([e]) => {
      const h = e.contentRect.height;
      if (h > 300) setHeights({ main: Math.floor(h * 0.72), sub: Math.floor(h * 0.26) });
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const destroyCharts = useCallback(() => {
    try { chartRef.current?.remove(); } catch {}
    try { subChartRef.current?.remove(); } catch {}
    chartRef.current = subChartRef.current = mainSeries.current = subSeries.current = null;
    overlaySeries.current.clear();
    subExtra.current = [];
    isBuilt.current = false;
  }, []);

  useEffect(() => {
    if (!mainRef.current || !subRef.current || !history.length) return;
    const overlayKey = [...overlays].sort().join(",");
    const key = `${symbol}|${timeframe}|${chartType}|${overlayKey}|${subPanel}`;
    if (key === prevKey.current && isBuilt.current) return;
    prevKey.current = key;
    destroyCharts();

    const raw = chartType === "ha" ? toHeikinAshi(history) : history;
    const valid = raw.filter(b => b.open && b.high && b.low && b.close);
    if (!valid.length) return;

    /* ── Main chart ── */
    const mc = createChart(mainRef.current, chartOpts(heights.main));
    chartRef.current = mc;

    if (chartType === "area") {
      const s = mc.addSeries(AreaSeries, { topColor: C.upA, bottomColor: "transparent", lineColor: C.up, lineWidth: 2 });
      s.setData(valid.map(b => ({ time: b.time as UTCTimestamp, value: b.close })));
      mainSeries.current = s;
    } else {
      const s = mc.addSeries(CandlestickSeries, { upColor: C.up, downColor: C.down, borderUpColor: C.up, borderDownColor: C.down, wickUpColor: C.up, wickDownColor: C.down });
      s.setData(valid.map(b => ({ time: b.time as UTCTimestamp, open: b.open, high: b.high, low: b.low, close: b.close })));
      mainSeries.current = s;
    }

    /* ── Overlays ── */
    const addLine = (key: string, data: { time: UTCTimestamp; value: number }[], color: string, width = 1, style = 0) => {
      const s = mc.addSeries(LineSeries, { color, lineWidth: width as any, lineStyle: style as any, priceLineVisible: false, lastValueVisible: false });
      s.setData(data);
      overlaySeries.current.set(key, s);
    };

    if (overlays.has("ema9"))  addLine("ema9",  ema(valid, 9),  C.ema9);
    if (overlays.has("ema21")) addLine("ema21", ema(valid, 21), C.ema21);
    if (overlays.has("ema50")) addLine("ema50", ema(valid, 50), C.ema50);
    if (overlays.has("vwap"))  addLine("vwap",  vwap(valid),    C.vwap, 2);

    if (overlays.has("bb") && valid.length >= 20) {
      const bb = bollingerBands(valid);
      addLine("bbU", bb.upper, C.bb, 1);
      addLine("bbL", bb.lower, C.bb, 1);
      addLine("bbM", bb.mid,   C.bbMid, 1, 2);
    }

    if (overlays.has("sr")) {
      const levels = supportResistanceLevels(valid);
      levels.forEach(lvl => {
        const s = mainSeries.current!;
        s.createPriceLine({
          price: lvl.price,
          color: lvl.type === "support" ? C.sr.support : C.sr.resistance,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `${lvl.type === "support" ? "S" : "R"}${lvl.strength}`,
        });
      });
    }

    /* ── Sub chart ── */
    const sc = createChart(subRef.current, { ...chartOpts(heights.sub), rightPriceScale: { borderColor: C.border, scaleMargins: { top: 0.1, bottom: 0.1 } } });
    subChartRef.current = sc;
    let firstSub: ISeriesApi<any> | null = null;

    if (subPanel === "volume") {
      const vs = sc.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "right" });
      vs.setData(valid.map(b => ({ time: b.time as UTCTimestamp, value: b.volume, color: b.close >= b.open ? C.volUp : C.volDown })));
      firstSub = subSeries.current = vs;
    } else if (subPanel === "rsi" && valid.length > 15) {
      const rs = sc.addSeries(LineSeries, { color: C.rsiLine, lineWidth: 2, priceLineVisible: false, lastValueVisible: true });
      rs.setData(rsiSeries(valid));
      rs.createPriceLine({ price: 70, color: C.down, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "OB" });
      rs.createPriceLine({ price: 30, color: C.up,   lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "OS" });
      rs.createPriceLine({ price: 50, color: C.text, lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
      firstSub = subSeries.current = rs;
    } else if (subPanel === "macd" && valid.length > 35) {
      const { macd: md, sig, hist: hd } = macdSeries(valid);
      const hs = sc.addSeries(HistogramSeries, { priceScaleId: "right", color: "#10B981" });
      hs.setData(hd);
      const ms = sc.addSeries(LineSeries, { color: C.macdLine, lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      ms.setData(md);
      const ss = sc.addSeries(LineSeries, { color: C.sigLine,  lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      ss.setData(sig);
      subExtra.current = [ms, ss];
      firstSub = subSeries.current = hs;
    } else if (subPanel === "momentum" && valid.length > 12) {
      const mom = momentumSeries(valid);
      const ms = sc.addSeries(HistogramSeries, { priceScaleId: "right" });
      ms.setData(mom.map(p => ({ ...p, color: p.value >= 0 ? C.momPos : C.momNeg })));
      const zl = sc.addSeries(LineSeries, { color: "rgba(255,255,255,0.15)", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      zl.setData(mom.map(p => ({ time: p.time, value: 0 })));
      firstSub = subSeries.current = ms;
    } else if (subPanel === "stoch" && valid.length > 20) {
      const { k: kLine, d: dLine } = stochasticSeries(valid);
      const ks = sc.addSeries(LineSeries, { color: C.stochK, lineWidth: 2, priceLineVisible: false, lastValueVisible: true });
      ks.setData(kLine);
      const ds = sc.addSeries(LineSeries, { color: C.stochD, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      ds.setData(dLine);
      ks.createPriceLine({ price: 80, color: C.down, lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
      ks.createPriceLine({ price: 20, color: C.up,   lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: "" });
      subExtra.current = [ds];
      firstSub = subSeries.current = ks;
    }

    /* ── Crosshair sync + tooltip ── */
    const barMap = new Map(valid.map(b => [b.time, b]));
    mc.subscribeCrosshairMove((p: MouseEventParams) => {
      if (!p.time || !p.point) { setTooltip(null); return; }
      const b = barMap.get(p.time as number);
      if (b) setTooltip({ bar: b, x: p.point.x, y: p.point.y });
      if (firstSub) {
        const fv = p.seriesData.values().next().value as { value?: number } | undefined;
        sc.setCrosshairPosition(fv?.value ?? 0, p.time as UTCTimestamp, firstSub);
      }
    });
    mc.timeScale().subscribeVisibleLogicalRangeChange(r => { if (r) sc.timeScale().setVisibleLogicalRange(r); });
    sc.timeScale().subscribeVisibleLogicalRangeChange(r => { if (r) mc.timeScale().setVisibleLogicalRange(r); });

    mc.timeScale().fitContent();
    sc.timeScale().fitContent();
    isBuilt.current = true;
    return destroyCharts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe, chartType, overlays, subPanel, heights, history.length === 0 ? 0 : 1, destroyCharts]);

  /* ── Live tick — NO rebuild ── */
  useEffect(() => {
    if (!isBuilt.current || !mainSeries.current || !history.length) return;
    const raw   = chartType === "ha" ? toHeikinAshi(history) : history;
    const valid = raw.filter(b => b.open && b.high && b.low && b.close);
    const last  = valid[valid.length - 1];
    if (!last) return;
    try {
      if (chartType === "area") {
        mainSeries.current.update({ time: last.time as UTCTimestamp, value: last.close });
      } else {
        mainSeries.current.update({ time: last.time as UTCTimestamp, open: last.open, high: last.high, low: last.low, close: last.close });
      }
      const upd = (key: string, data: { time: UTCTimestamp; value: number }[]) => {
        const s = overlaySeries.current.get(key);
        if (s && data.length) s.update(data[data.length - 1]);
      };
      if (overlays.has("ema9"))  upd("ema9",  ema(valid, 9));
      if (overlays.has("ema21")) upd("ema21", ema(valid, 21));
      if (overlays.has("ema50")) upd("ema50", ema(valid, 50));
      if (overlays.has("vwap"))  upd("vwap",  vwap(valid));
      if (overlays.has("bb") && valid.length >= 20) {
        const bb = bollingerBands(valid);
        upd("bbU", bb.upper); upd("bbL", bb.lower); upd("bbM", bb.mid);
      }
      if (subPanel === "volume" && subSeries.current) {
        subSeries.current.update({ time: last.time as UTCTimestamp, value: last.volume, color: last.close >= last.open ? C.volUp : C.volDown });
      } else if (subPanel === "rsi" && subSeries.current && valid.length > 15) {
        const r = rsiSeries(valid); if (r.length) subSeries.current.update(r[r.length - 1]);
      } else if (subPanel === "macd" && subSeries.current && subExtra.current.length >= 2 && valid.length > 35) {
        const { macd: md, sig, hist: hd } = macdSeries(valid);
        if (hd.length) { subSeries.current.update(hd[hd.length - 1]); subExtra.current[0].update(md[md.length - 1]); subExtra.current[1].update(sig[sig.length - 1]); }
      } else if (subPanel === "momentum" && subSeries.current && valid.length > 12) {
        const mom = momentumSeries(valid);
        if (mom.length) { const p = mom[mom.length - 1]; subSeries.current.update({ ...p, color: p.value >= 0 ? C.momPos : C.momNeg }); }
      } else if (subPanel === "stoch" && subSeries.current && subExtra.current.length >= 1 && valid.length > 20) {
        const { k: kLine, d: dLine } = stochasticSeries(valid);
        if (kLine.length) subSeries.current.update(kLine[kLine.length - 1]);
        if (dLine.length) subExtra.current[0].update(dLine[dLine.length - 1]);
      }
    } catch { /* stale series after rebuild */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history[history.length - 1]?.close, history[history.length - 1]?.high, history[history.length - 1]?.low, history[history.length - 1]?.volume]);

  const toggleOverlay = (o: Overlay) => setOverlays(prev => { const n = new Set(prev); n.has(o) ? n.delete(o) : n.add(o); return n; });
  const loading = initialising || historyLoading;
  const pnl     = history.length > 1 ? ((history[history.length - 1].close - history[0].close) / history[0].close) * 100 : 0;
  const pnlCol  = pnl >= 0 ? C.up : C.down;

  const OVERLAYS: { key: Overlay; label: string; color: string }[] = [
    { key: "ema9",  label: "EMA9",  color: C.ema9  },
    { key: "ema21", label: "EMA21", color: C.ema21 },
    { key: "ema50", label: "EMA50", color: C.ema50 },
    { key: "vwap",  label: "VWAP",  color: C.vwap  },
    { key: "bb",    label: "BB",    color: "#93C5FD" },
    { key: "sr",    label: "S/R",   color: C.up },
  ];
  const SUBPANELS: { key: SubPanel; label: string }[] = [
    { key: "volume",   label: "VOL"   },
    { key: "rsi",      label: "RSI"   },
    { key: "macd",     label: "MACD"  },
    { key: "momentum", label: "MOM"   },
    { key: "stoch",    label: "STOCH" },
  ];

  if (loading && !history.length) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "1rem", height: "100%" }}>
      <div style={{ flex: 3, background: "rgba(255,255,255,0.04)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  );
  if (error && !history.length) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#EF4444", fontSize: "0.82rem" }}>⚠ {error}</div>
  );
  if (!history.length) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6B7280", fontSize: "0.82rem" }}>
      Search a symbol to load the terminal
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", userSelect: "none" }}>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.18)", flexWrap: "wrap", flexShrink: 0 }}>

        {/* Timeframes */}
        {TIMEFRAMES.map(tf => (
          <button key={tf} onClick={() => onTfChange?.(tf)} style={tf === timeframe ? BTNA : BTN}>{tf}</button>
        ))}

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)", margin: "0 0.2rem", flexShrink: 0 }} />

        {/* Chart type */}
        {(["candle", "ha", "area"] as ChartType[]).map(ct => (
          <button key={ct} onClick={() => setChartType(ct)} style={ct === chartType ? BTNA : BTN}>
            {ct === "candle" ? "CDL" : ct === "ha" ? "HA" : "AREA"}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)", margin: "0 0.2rem", flexShrink: 0 }} />

        {/* Overlays */}
        {OVERLAYS.map(o => (
          <button key={o.key} onClick={() => toggleOverlay(o.key)}
            style={overlays.has(o.key)
              ? { ...BTN, background: `${o.color}18`, border: `1px solid ${o.color}60`, color: o.color }
              : BTN}>
            {o.label}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)", margin: "0 0.2rem", flexShrink: 0 }} />

        {/* Sub panels */}
        {SUBPANELS.map(p => (
          <button key={p.key} onClick={() => setSubPanel(p.key)} style={p.key === subPanel ? BTNA : BTN}>{p.label}</button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: C.up }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.up, animation: "pulse 1.5s ease-in-out infinite", display: "inline-block" }} />
            LIVE
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: pnlCol, fontWeight: 700 }}>
            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}% ({timeframe})
          </span>
        </div>
      </div>

      {/* ── Chart area ── */}
      <div ref={containerRef} style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

        {/* Advanced OHLCV + indicator tooltip */}
        {tooltip && (
          <div style={{
            position: "absolute", top: 8, left: 10, zIndex: 20,
            background: "rgba(8,12,20,0.92)", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
            padding: "6px 10px", pointerEvents: "none",
            display: "flex", gap: 14,
          }}>
            {([["O", tooltip.bar.open], ["H", tooltip.bar.high], ["L", tooltip.bar.low], ["C", tooltip.bar.close], ["V", tooltip.bar.volume]] as [string, number][]).map(([l, v]) => (
              <span key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <span style={{ fontSize: "0.52rem", color: "#4B5563", letterSpacing: "0.08em" }}>{l}</span>
                <span style={{
                  fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                  color: l === "H" ? C.up : l === "L" ? C.down : "#E5E7EB",
                }}>
                  {l === "V"
                    ? (v > 1e6 ? (v / 1e6).toFixed(1) + "M" : (v / 1e3).toFixed(0) + "K")
                    : v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Overlay legend */}
        <div style={{ position: "absolute", top: 8, right: 10, zIndex: 10, display: "flex", gap: "0.45rem", pointerEvents: "none", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {OVERLAYS.filter(o => overlays.has(o.key)).map(o => (
            <span key={o.key} style={{ fontSize: "0.6rem", color: o.color, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{o.label}</span>
          ))}
        </div>

        {/* Refresh spinner */}
        {loading && history.length > 0 && (
          <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 10, fontSize: "0.62rem", color: "#6B7280", background: "rgba(0,0,0,0.6)", borderRadius: 12, padding: "0.15rem 0.5rem" }}>
            refreshing…
          </div>
        )}

        <div ref={mainRef} style={{ flex: "1 1 auto", minHeight: 0 }} />
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", padding: "0 0.75rem", height: 20, background: "rgba(0,0,0,0.12)", flexShrink: 0 }}>
          <span style={{ fontSize: "0.58rem", color: "#4B5563", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {subPanel} · {symbol || "—"}
          </span>
        </div>
        <div ref={subRef} style={{ height: heights.sub, flexShrink: 0 }} />
      </div>
    </div>
  );
});

export default StockChart;
