"use client";

import {
  useEffect, useRef, useState, useCallback, memo
} from "react";
import {
  createChart, CandlestickSeries, AreaSeries, HistogramSeries, LineSeries,
  CrosshairMode, ColorType,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type MouseEventParams,
} from "lightweight-charts";
import { useMarketStore } from "@/store/marketStore";
import type { OHLCVBar } from "@/types";
import type { Timeframe } from "@/lib/workerApi";

/* ── Palette ─────────────────────────────────────────────────── */
const C = {
  up: "#00FFA3", down: "#EF4444",
  upA: "rgba(0,255,163,0.10)", downA: "rgba(239,68,68,0.10)",
  volUp: "rgba(0,255,163,0.38)", volDown: "rgba(239,68,68,0.38)",
  ema9: "#F59E0B", ema21: "#3B82F6", ema50: "#A855F7",
  bb: "rgba(59,130,246,0.35)", bbMid: "rgba(59,130,246,0.6)",
  rsiLine: "#F59E0B", macdLine: "#3B82F6", sigLine: "#F59E0B", histColor: "#10B981",
  grid: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.07)", text: "#6B7280",
};

/* ── Computation helpers ─────────────────────────────────────── */
function ema(bars: OHLCVBar[], period: number): { time: UTCTimestamp; value: number }[] {
  const k = 2 / (period + 1); let e = 0;
  return bars.reduce<{ time: UTCTimestamp; value: number }[]>((acc, b, i) => {
    e = i === 0 ? b.close : b.close * k + e * (1 - k);
    if (i >= period - 1) acc.push({ time: b.time as UTCTimestamp, value: e });
    return acc;
  }, []);
}

function rsiSeries(bars: OHLCVBar[], period = 14) {
  const out: { time: UTCTimestamp; value: number }[] = [];
  if (bars.length < period + 1) return out;
  let avgG = 0, avgL = 0;
  for (let i = 1; i <= period; i++) { const d = bars[i].close - bars[i-1].close; d > 0 ? (avgG += d) : (avgL -= d); }
  avgG /= period; avgL /= period;
  for (let i = period; i < bars.length; i++) {
    if (i > period) { const d = bars[i].close - bars[i-1].close; avgG = (avgG*(period-1)+Math.max(d,0))/period; avgL = (avgL*(period-1)+Math.max(-d,0))/period; }
    out.push({ time: bars[i].time as UTCTimestamp, value: avgL === 0 ? 100 : 100 - 100/(1+avgG/avgL) });
  }
  return out;
}

function macdSeries(bars: OHLCVBar[]) {
  const e12 = ema(bars,12), e26 = ema(bars,26);
  const off  = e12.length - e26.length;
  const macd = e26.map((v,i) => ({ time: v.time, value: e12[i+off].value - v.value }));
  let sv = 0; const k = 2/10;
  const sig = macd.reduce<{time: UTCTimestamp; value: number}[]>((acc,m,i) => {
    sv = i===0 ? m.value : m.value*k + sv*(1-k);
    if (i >= 8) acc.push({ time: m.time, value: sv });
    return acc;
  }, []);
  const off2 = macd.length - sig.length;
  const hist = sig.map((s,i) => { const h = macd[i+off2].value-s.value; return { time: s.time, value: h, color: h>=0?C.histColor:C.down }; });
  return { macd, sig, hist };
}

function bollingerBands(bars: OHLCVBar[], period=20, mult=2) {
  const upper: {time:UTCTimestamp;value:number}[] = [], lower: {time:UTCTimestamp;value:number}[] = [], mid: {time:UTCTimestamp;value:number}[] = [];
  for (let i = period-1; i < bars.length; i++) {
    const sl = bars.slice(i-period+1,i+1).map(b=>b.close);
    const mn = sl.reduce((a,v)=>a+v,0)/period;
    const sd = Math.sqrt(sl.reduce((a,v)=>a+(v-mn)**2,0)/period);
    const t  = bars[i].time as UTCTimestamp;
    upper.push({time:t,value:mn+mult*sd}); lower.push({time:t,value:mn-mult*sd}); mid.push({time:t,value:mn});
  }
  return { upper, lower, mid };
}

function toHeikinAshi(bars: OHLCVBar[]): OHLCVBar[] {
  return bars.map((b,i,a) => {
    const haC=(b.open+b.high+b.low+b.close)/4, haO=i===0?(b.open+b.close)/2:(a[i-1].open+a[i-1].close)/2;
    return { ...b, open:haO, high:Math.max(b.high,haO,haC), low:Math.min(b.low,haO,haC), close:haC };
  });
}

/* ── Types ──────────────────────────────────────────────────── */
type ChartType = "candle" | "area" | "ha";
type Overlay   = "ema9" | "ema21" | "ema50" | "bb";
type SubPanel  = "volume" | "rsi" | "macd";

const TIMEFRAMES: Timeframe[] = ["1D","5D","1M","3M","6M","1Y","5Y","MAX"];
const CHART_TYPES = [{ key:"candle" as ChartType, label:"Candles" },{ key:"ha" as ChartType, label:"Heikin Ashi" },{ key:"area" as ChartType, label:"Area" }];

/* ── Shared chart options factory ────────────────────────────── */
function chartOpts(height: number, timeVisible=true) {
  return {
    layout:    { background: { type:ColorType.Solid, color:"transparent" }, textColor:C.text, fontSize:11 },
    grid:      { vertLines:{ color:C.grid }, horzLines:{ color:C.grid } },
    crosshair: { mode:CrosshairMode.Normal },
    rightPriceScale: { borderColor:C.border, scaleMargins:{ top:0.08, bottom:0.04 } },
    timeScale: { borderColor:C.border, timeVisible, secondsVisible:false },
    height, handleScroll:true, handleScale:true,
  } as const;
}

/* ── Button styles ───────────────────────────────────────────── */
const BTN: React.CSSProperties = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:5, color:"#6B7280", fontSize:"0.68rem", fontWeight:600, cursor:"pointer", padding:"0.2rem 0.5rem", letterSpacing:"0.04em", transition:"all 0.12s ease" };
const BTNA: React.CSSProperties = { ...BTN, background:"rgba(59,130,246,0.18)", border:"1px solid rgba(59,130,246,0.4)", color:"#60A5FA" };
const BTNOL: Record<Overlay,React.CSSProperties> = {
  ema9:  { ...BTN, background:"rgba(245,158,11,0.15)", border:"1px solid #F59E0B60", color:C.ema9  },
  ema21: { ...BTN, background:"rgba(59,130,246,0.15)", border:"1px solid #3B82F660", color:C.ema21 },
  ema50: { ...BTN, background:"rgba(168,85,247,0.15)", border:"1px solid #A855F760", color:C.ema50 },
  bb:    { ...BTN, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.35)", color:"#93C5FD" },
};

/* ═══════════════════════════════════════════════════════════════
   StockChart
   - Reads from Zustand store (not props) for live reactivity
   - Full chart re-build: only on symbol / chartType / overlays / subPanel change
   - Live tick: calls mainSeries.current.update() — NO chart recreation
═══════════════════════════════════════════════════════════════ */
interface Props {
  onTfChange?: (tf: Timeframe) => void;
}

const StockChart = memo(function StockChart({ onTfChange }: Props) {
  /* ── Store selectors ── */
  const symbol        = useMarketStore(s => s.symbol);
  const history       = useMarketStore(s => s.history);
  const timeframe     = useMarketStore(s => s.timeframe);
  const historyLoading = useMarketStore(s => s.historyLoading);
  const initialising  = useMarketStore(s => s.initialising);
  const error         = useMarketStore(s => s.error);

  /* ── Local UI state ── */
  const [chartType, setChartType] = useState<ChartType>("candle");
  const [overlays,  setOverlays]  = useState<Set<Overlay>>(new Set(["ema9","ema21","ema50"]));
  const [subPanel,  setSubPanel]  = useState<SubPanel>("volume");
  const [tooltip,   setTooltip]   = useState<{ bar: OHLCVBar } | null>(null);
  const [heights,   setHeights]   = useState({ main: 340, sub: 120 });

  /* ── Refs ── */
  const mainRef       = useRef<HTMLDivElement>(null);
  const subRef        = useRef<HTMLDivElement>(null);
  const chartRef      = useRef<IChartApi | null>(null);
  const subChartRef   = useRef<IChartApi | null>(null);
  const mainSeries    = useRef<ISeriesApi<any> | null>(null);
  const subSeries     = useRef<ISeriesApi<any> | null>(null);
  const ema9Series    = useRef<ISeriesApi<any> | null>(null);
  const ema21Series   = useRef<ISeriesApi<any> | null>(null);
  const ema50Series   = useRef<ISeriesApi<any> | null>(null);
  const bbUpperSeries = useRef<ISeriesApi<any> | null>(null);
  const bbLowerSeries = useRef<ISeriesApi<any> | null>(null);
  const bbMidSeries   = useRef<ISeriesApi<any> | null>(null);
  const macdLineSeries= useRef<ISeriesApi<any> | null>(null);
  const sigLineSeries = useRef<ISeriesApi<any> | null>(null);
  const prevSymbol    = useRef("");
  const prevTf        = useRef<Timeframe>("6M");
  const prevType      = useRef<ChartType>("candle");
  const prevOverlays  = useRef<string>("");
  const prevSubPanel  = useRef<SubPanel>("volume");
  const isBuilt       = useRef(false);

  /* ── Responsive height ── */
  useEffect(() => {
    const el = mainRef.current?.parentElement?.parentElement;
    if (!el) return;
    const ob = new ResizeObserver(([e]) => {
      const h = e.contentRect.height;
      if (h > 300) setHeights({ main: Math.floor(h * 0.72), sub: Math.floor(h * 0.26) });
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  /* ── Destroy helper ── */
  const destroyCharts = useCallback(() => {
    try { chartRef.current?.remove(); }    catch {}
    try { subChartRef.current?.remove(); } catch {}
    chartRef.current = subChartRef.current = mainSeries.current = subSeries.current = null;
    ema9Series.current = ema21Series.current = ema50Series.current = null;
    bbUpperSeries.current = bbLowerSeries.current = bbMidSeries.current = null;
    macdLineSeries.current = sigLineSeries.current = null;
    isBuilt.current = false;
  }, []);

  /* ── FULL rebuild: symbol / chartType / overlays / subPanel change ── */
  useEffect(() => {
    if (!mainRef.current || !subRef.current) return;
    if (!history.length) return;

    const symbolChanged   = prevSymbol.current !== symbol;
    const tfChanged       = prevTf.current !== timeframe;
    const typeChanged     = prevType.current !== chartType;
    const overlayKey      = [...overlays].sort().join(",");
    const overlayChanged  = prevOverlays.current !== overlayKey;
    const panelChanged    = prevSubPanel.current !== subPanel;

    const needsRebuild = symbolChanged || tfChanged || typeChanged || overlayChanged || panelChanged || !isBuilt.current;
    if (!needsRebuild) return;

    prevSymbol.current   = symbol;
    prevTf.current       = timeframe;
    prevType.current     = chartType;
    prevOverlays.current = overlayKey;
    prevSubPanel.current = subPanel;

    destroyCharts();

    /* ── Main chart ── */
    const mc = createChart(mainRef.current, chartOpts(heights.main));
    chartRef.current = mc;

    const valid = (chartType === "ha" ? toHeikinAshi(history) : history)
      .filter(b => b.open && b.high && b.low && b.close);

    if (chartType === "area") {
      const s = mc.addSeries(AreaSeries, { topColor:C.upA, bottomColor:"transparent", lineColor:C.up, lineWidth:2 });
      s.setData(valid.map(b => ({ time:b.time as UTCTimestamp, value:b.close })));
      mainSeries.current = s;
    } else {
      const s = mc.addSeries(CandlestickSeries, { upColor:C.up, downColor:C.down, borderUpColor:C.up, borderDownColor:C.down, wickUpColor:C.up, wickDownColor:C.down });
      s.setData(valid.map(b => ({ time:b.time as UTCTimestamp, open:b.open, high:b.high, low:b.low, close:b.close })));
      mainSeries.current = s;
    }

    /* Overlays */
    if (overlays.has("ema9")) {
      const s = mc.addSeries(LineSeries, { color:C.ema9,  lineWidth:1, priceLineVisible:false, lastValueVisible:false });
      s.setData(ema(valid,9));
      ema9Series.current = s;
    }
    if (overlays.has("ema21")) {
      const s = mc.addSeries(LineSeries, { color:C.ema21, lineWidth:1, priceLineVisible:false, lastValueVisible:false });
      s.setData(ema(valid,21));
      ema21Series.current = s;
    }
    if (overlays.has("ema50")) {
      const s = mc.addSeries(LineSeries, { color:C.ema50, lineWidth:1, priceLineVisible:false, lastValueVisible:false });
      s.setData(ema(valid,50));
      ema50Series.current = s;
    }
    if (overlays.has("bb") && valid.length >= 20) {
      const bb = bollingerBands(valid);
      const sU = mc.addSeries(LineSeries,{color:C.bb,lineWidth:1,priceLineVisible:false,lastValueVisible:false});
      sU.setData(bb.upper);
      bbUpperSeries.current = sU;
      const sL = mc.addSeries(LineSeries,{color:C.bb,lineWidth:1,priceLineVisible:false,lastValueVisible:false});
      sL.setData(bb.lower);
      bbLowerSeries.current = sL;
      const sM = mc.addSeries(LineSeries,{color:C.bbMid,lineWidth:1,lineStyle:2,priceLineVisible:false,lastValueVisible:false});
      sM.setData(bb.mid);
      bbMidSeries.current = sM;
    }

    /* ── Sub chart ── */
    const sc = createChart(subRef.current, { ...chartOpts(heights.sub), rightPriceScale:{ borderColor:C.border, scaleMargins:{ top:0.1, bottom:0.1 } } });
    subChartRef.current = sc;

    let firstSub: ISeriesApi<any> | null = null;
    if (subPanel === "volume") {
      const vs = sc.addSeries(HistogramSeries,{ priceFormat:{type:"volume"}, priceScaleId:"right" });
      vs.setData(valid.map(b => ({ time:b.time as UTCTimestamp, value:b.volume, color:b.close>=b.open?C.volUp:C.volDown })));
      firstSub = subSeries.current = vs;
    } else if (subPanel === "rsi" && valid.length > 15) {
      const rs = sc.addSeries(LineSeries,{ color:C.rsiLine, lineWidth:2, priceLineVisible:false, lastValueVisible:true });
      rs.setData(rsiSeries(valid));
      rs.createPriceLine({ price:70, color:C.down, lineWidth:1, lineStyle:2, axisLabelVisible:true, title:"OB" });
      rs.createPriceLine({ price:30, color:C.up,   lineWidth:1, lineStyle:2, axisLabelVisible:true, title:"OS" });
      firstSub = subSeries.current = rs;
    } else if (subPanel === "macd" && valid.length > 35) {
      const { macd:md, sig, hist:hd } = macdSeries(valid);
      const hs = sc.addSeries(HistogramSeries,{ priceScaleId:"right", color:C.histColor });
      hs.setData(hd);
      const ms = sc.addSeries(LineSeries,{ color:C.macdLine, lineWidth:2, priceLineVisible:false, lastValueVisible:false });
      ms.setData(md);
      macdLineSeries.current = ms;
      const ss = sc.addSeries(LineSeries,{ color:C.sigLine,  lineWidth:1, priceLineVisible:false, lastValueVisible:false });
      ss.setData(sig);
      sigLineSeries.current = ss;
      firstSub = subSeries.current = hs;
    }

    /* Crosshair + timescale sync */
    const barMap = new Map(valid.map(b => [b.time, b]));
    mc.subscribeCrosshairMove((p: MouseEventParams) => {
      if (!p.time) { setTooltip(null); return; }
      const b = barMap.get(p.time as number);
      if (b && p.point) setTooltip({ bar:b });
      if (firstSub) {
        const fv = p.seriesData.values().next().value as {value?:number}|undefined;
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

  /* ── LIVE TICK: update last candle only, no chart recreation ── */
  useEffect(() => {
    if (!isBuilt.current || !mainSeries.current || !history.length) return;
    const last = history[history.length - 1];
    if (!last) return;

    try {
      if (chartType === "area") {
        mainSeries.current.update({ time: last.time as UTCTimestamp, value: last.close });
      } else {
        const hA = chartType === "ha" ? toHeikinAshi(history) : history;
        const lastHA = hA[hA.length - 1];
        mainSeries.current.update({ time: lastHA.time as UTCTimestamp, open:lastHA.open, high:lastHA.high, low:lastHA.low, close:lastHA.close });
      }
      
      const valid = chartType === "ha" ? toHeikinAshi(history).filter(b => b.open && b.high && b.low && b.close) : history.filter(b => b.open && b.high && b.low && b.close);
      
      // Update Overlays
      if (overlays.has("ema9") && ema9Series.current) {
        const e = ema(valid, 9);
        if (e.length) ema9Series.current.update(e[e.length - 1]);
      }
      if (overlays.has("ema21") && ema21Series.current) {
        const e = ema(valid, 21);
        if (e.length) ema21Series.current.update(e[e.length - 1]);
      }
      if (overlays.has("ema50") && ema50Series.current) {
        const e = ema(valid, 50);
        if (e.length) ema50Series.current.update(e[e.length - 1]);
      }
      if (overlays.has("bb") && bbUpperSeries.current && bbLowerSeries.current && bbMidSeries.current && valid.length >= 20) {
        const bb = bollingerBands(valid);
        if (bb.upper.length) {
          bbUpperSeries.current.update(bb.upper[bb.upper.length - 1]);
          bbLowerSeries.current.update(bb.lower[bb.lower.length - 1]);
          bbMidSeries.current.update(bb.mid[bb.mid.length - 1]);
        }
      }

      // Update SubPanel
      if (subPanel === "volume" && subSeries.current) {
        subSeries.current.update({ time: last.time as UTCTimestamp, value: last.volume, color: last.close >= last.open ? C.volUp : C.volDown });
      } else if (subPanel === "rsi" && subSeries.current && valid.length > 15) {
        const rsi = rsiSeries(valid);
        if (rsi.length) subSeries.current.update(rsi[rsi.length - 1]);
      } else if (subPanel === "macd" && subSeries.current && macdLineSeries.current && sigLineSeries.current && valid.length > 35) {
        const { macd:md, sig, hist:hd } = macdSeries(valid);
        if (hd.length && md.length && sig.length) {
          subSeries.current.update(hd[hd.length - 1]);
          macdLineSeries.current.update(md[md.length - 1]);
          sigLineSeries.current.update(sig[sig.length - 1]);
        }
      }
    } catch {
      // Stale series after rebuild — ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history[history.length - 1]?.close, history[history.length - 1]?.high, history[history.length - 1]?.low, history[history.length - 1]?.volume, history[history.length - 1]?.time]);

  /* ── Overlay toggle ── */
  const toggleOverlay = (o: Overlay) => setOverlays(prev => { const n = new Set(prev); n.has(o) ? n.delete(o) : n.add(o); return n; });

  const loading = initialising || historyLoading;

  /* ── Period PnL ── */
  const pnl    = history.length > 1 ? ((history[history.length-1].close - history[0].close) / history[0].close) * 100 : 0;
  const pnlCol = pnl >= 0 ? C.up : C.down;

  /* ── Render guards ── */
  if (loading && !history.length) return (
    <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", padding:"1rem", height:"100%" }}>
      <div style={{ flex:3, background:"rgba(255,255,255,0.04)", borderRadius:8, animation:"pulse 1.5s ease-in-out infinite" }} />
      <div style={{ flex:1, background:"rgba(255,255,255,0.04)", borderRadius:8, animation:"pulse 1.5s ease-in-out infinite" }} />
    </div>
  );
  if (error && !history.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", flexDirection:"column", gap:"0.5rem", color:"#EF4444", fontSize:"0.82rem" }}>
      ⚠ {error}
    </div>
  );
  if (!history.length) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#6B7280", fontSize:"0.82rem" }}>
      Search a symbol to load the terminal
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", userSelect:"none" }}>

      {/* ── Toolbar ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.375rem", padding:"0.5rem 0.875rem", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,0,0,0.18)", flexWrap:"wrap" }}>

        {TIMEFRAMES.map(tf => (
          <button key={tf} onClick={() => onTfChange?.(tf)} style={tf===timeframe ? BTNA : BTN}>{tf}</button>
        ))}

        <div style={{ width:1, height:16, background:"rgba(255,255,255,0.07)", margin:"0 0.2rem" }} />

        {CHART_TYPES.map(ct => (
          <button key={ct.key} onClick={() => setChartType(ct.key)} style={ct.key===chartType ? BTNA : BTN}>{ct.label}</button>
        ))}

        <div style={{ width:1, height:16, background:"rgba(255,255,255,0.07)", margin:"0 0.2rem" }} />

        {(["ema9","ema21","ema50","bb"] as Overlay[]).map(o => (
          <button key={o} onClick={() => toggleOverlay(o)} style={overlays.has(o) ? BTNOL[o] : BTN}>
            {o==="bb" ? "BB" : o.toUpperCase()}
          </button>
        ))}

        <div style={{ width:1, height:16, background:"rgba(255,255,255,0.07)", margin:"0 0.2rem" }} />

        {(["volume","rsi","macd"] as SubPanel[]).map(p => (
          <button key={p} onClick={() => setSubPanel(p)} style={p===subPanel ? BTNA : BTN}>{p.toUpperCase()}</button>
        ))}

        {/* Live indicator */}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"0.3rem", fontSize:"0.65rem", color:C.up }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.up, animation:"pulse 1.5s ease-in-out infinite", display:"inline-block" }} />
            LIVE
          </span>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.72rem", color:pnlCol, fontWeight:700 }}>
            {pnl>=0?"+":""}{pnl.toFixed(2)}% ({timeframe})
          </span>
        </div>
      </div>

      {/* ── Chart area ── */}
      <div style={{ position:"relative", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>

        {/* OHLCV tooltip */}
        {tooltip && (
          <div style={{ position:"absolute", top:8, left:12, zIndex:10, display:"flex", gap:"0.625rem", padding:"0.3rem 0.6rem", background:"rgba(0,0,0,0.75)", borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", pointerEvents:"none" }}>
            {([["O",tooltip.bar.open],["H",tooltip.bar.high],["L",tooltip.bar.low],["C",tooltip.bar.close],["V",tooltip.bar.volume]] as [string,number][]).map(([l,v]) => (
              <span key={l} style={{ fontSize:"0.7rem", fontFamily:"var(--font-mono)" }}>
                <span style={{ color:"#6B7280", marginRight:2 }}>{l}</span>
                <span style={{ color: l==="H"?C.up : l==="L"?C.down : "#E5E7EB" }}>
                  {l==="V" ? (v>1e6?(v/1e6).toFixed(1)+"M":(v/1e3).toFixed(0)+"K") : v.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Overlay legend */}
        <div style={{ position:"absolute", top:8, right:12, zIndex:10, display:"flex", gap:"0.45rem", pointerEvents:"none" }}>
          {overlays.has("ema9")  && <span style={{ fontSize:"0.63rem", color:C.ema9,  fontFamily:"var(--font-mono)" }}>EMA9</span>}
          {overlays.has("ema21") && <span style={{ fontSize:"0.63rem", color:C.ema21, fontFamily:"var(--font-mono)" }}>EMA21</span>}
          {overlays.has("ema50") && <span style={{ fontSize:"0.63rem", color:C.ema50, fontFamily:"var(--font-mono)" }}>EMA50</span>}
          {overlays.has("bb")    && <span style={{ fontSize:"0.63rem", color:"#93C5FD",fontFamily:"var(--font-mono)" }}>BB20</span>}
        </div>

        {/* Stale-while-revalidate spinner */}
        {loading && history.length > 0 && (
          <div style={{ position:"absolute", top:8, right:"50%", transform:"translateX(50%)", zIndex:10, fontSize:"0.62rem", color:"#6B7280", background:"rgba(0,0,0,0.6)", borderRadius:12, padding:"0.15rem 0.5rem", backdropFilter:"blur(4px)" }}>
            refreshing…
          </div>
        )}

        <div ref={mainRef} style={{ flex:"1 1 auto", minHeight:0 }} />
        <div style={{ height:1, background:"rgba(255,255,255,0.05)" }} />
        <div style={{ display:"flex", alignItems:"center", padding:"0 0.875rem", height:20, background:"rgba(0,0,0,0.12)" }}>
          <span style={{ fontSize:"0.6rem", color:"#4B5563", fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase" }}>
            {subPanel} · {symbol || "—"}
          </span>
        </div>
        <div ref={subRef} style={{ height:heights.sub, flexShrink:0 }} />
      </div>
    </div>
  );
});

export default StockChart;
