"use client";

/**
 * StockChart — production-grade TradingView Lightweight Charts v5 wrapper.
 *
 * Features:
 *  • Candlestick ↔ Area/Line chart toggle
 *  • Volume histogram sub-pane
 *  • Period filter (1M · 3M · 6M · 1Y · All)
 *  • Custom OHLCV crosshair tooltip overlay
 *  • ResizeObserver for responsive container
 *  • Proper cleanup — no memory leaks
 *  • Loading skeleton + API-failure state
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  CrosshairMode,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type AreaSeriesOptions,
  type HistogramSeriesOptions,
  type CandlestickData,
  type AreaData,
  type HistogramData,
  type UTCTimestamp,
  type MouseEventParams,
} from "lightweight-charts";
import type { OHLCVBar } from "@/types";
import styles from "./StockChart.module.css";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type ChartType = "candle" | "area";
type Period    = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface Props {
  data:    OHLCVBar[];
  symbol?: string;
  /** Pass `true` while the parent is fetching data */
  loading?: boolean;
  /** Pass an error string to show the error state */
  error?: string | null;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */

const PERIOD_DAYS: Record<Period, number> = {
  "1M":  30,
  "3M":  90,
  "6M":  180,
  "1Y":  365,
  "ALL": Infinity,
};

const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "ALL"];

/* ─── Dark theme tokens ─────────────────────────────────────────────────── */

const CHART_BG        = "transparent";
const GRID_COLOR      = "rgba(255,255,255,0.04)";
const BORDER_COLOR    = "rgba(255,255,255,0.08)";
const TEXT_COLOR      = "#9CA3AF";
const UP_COLOR        = "#00FFA3";
const DOWN_COLOR      = "#EF4444";
const AREA_TOP        = "rgba(0,255,163,0.18)";
const AREA_BOT        = "rgba(0,255,163,0)";
const AREA_LINE       = "#00FFA3";
const VOL_UP          = "rgba(0,255,163,0.35)";
const VOL_DOWN        = "rgba(239,68,68,0.35)";

/* ─── Data transformation ────────────────────────────────────────────────
 *
 * lightweight-charts expects { time: UTCTimestamp, open, high, low, close }
 * where time is UNIX seconds (number).
 * OHLCVBar.time is already UNIX seconds from the FMP worker.
 */

function toCandles(bars: OHLCVBar[]): CandlestickData[] {
  return bars
    .filter(b => b.open && b.high && b.low && b.close)
    .map(b => ({
      time:  b.time as UTCTimestamp,
      open:  b.open,
      high:  b.high,
      low:   b.low,
      close: b.close,
    }));
}

function toArea(bars: OHLCVBar[]): AreaData[] {
  return bars
    .filter(b => b.close)
    .map(b => ({
      time:  b.time as UTCTimestamp,
      value: b.close,
    }));
}

function toVolume(bars: OHLCVBar[]): HistogramData[] {
  return bars
    .filter(b => b.volume)
    .map(b => ({
      time:  b.time as UTCTimestamp,
      value: b.volume,
      color: b.close >= b.open ? VOL_UP : VOL_DOWN,
    }));
}

/** Slice data to the most-recent N calendar days */
function slicePeriod(bars: OHLCVBar[], period: Period): OHLCVBar[] {
  if (period === "ALL" || bars.length === 0) return bars;
  const days   = PERIOD_DAYS[period];
  const cutoff = bars[bars.length - 1].time - days * 86_400;
  return bars.filter(b => b.time >= cutoff);
}

/* ─── Tooltip state ─────────────────────────────────────────────────────── */

interface TooltipData {
  time:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
  x:      number;
  y:      number;
}

/* ─── StockChart component ─────────────────────────────────────────────── */

function StockChart({ data, symbol, loading = false, error = null }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const chartRef      = useRef<IChartApi | null>(null);
  const candleRef     = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const areaRef       = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeRef     = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [chartType, setChartType] = useState<ChartType>("candle");
  const [period,    setPeriod]    = useState<Period>("6M");
  const [tooltip,   setTooltip]   = useState<TooltipData | null>(null);

  /* ── Build chart instance once ───────────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    /* ── Create chart ── */
    const chart = createChart(el, {
      width:  el.clientWidth,
      height: el.clientHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: CHART_BG },
        textColor:  TEXT_COLOR,
        fontSize:   11,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: GRID_COLOR },
        horzLines: { color: GRID_COLOR },
      },
      crosshair: {
        mode:       CrosshairMode.Normal,
        vertLine: {
          color:       "rgba(255,255,255,0.15)",
          labelBackgroundColor: "#1A2233",
        },
        horzLine: {
          color:       "rgba(255,255,255,0.15)",
          labelBackgroundColor: "#1A2233",
        },
      },
      rightPriceScale: {
        borderColor: BORDER_COLOR,
        scaleMargins: { top: 0.08, bottom: 0.28 }, // leave room for volume pane
      },
      timeScale: {
        borderColor:    BORDER_COLOR,
        timeVisible:    true,
        secondsVisible: false,
        barSpacing:     8,
      },
      handleScale:  { axisPressedMouseMove: { time: true, price: false } },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
    });

    /* ── Candlestick series ── */
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:         UP_COLOR,
      downColor:       DOWN_COLOR,
      borderUpColor:   UP_COLOR,
      borderDownColor: DOWN_COLOR,
      wickUpColor:     UP_COLOR,
      wickDownColor:   DOWN_COLOR,
      priceScaleId:    "right",
      visible:         true,
    } as Partial<CandlestickSeriesOptions>);

    /* ── Area series (hidden initially) ── */
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor:      AREA_TOP,
      bottomColor:   AREA_BOT,
      lineColor:     AREA_LINE,
      lineWidth:     2,
      priceScaleId:  "right",
      visible:       false,
    } as Partial<AreaSeriesOptions>);

    /* ── Volume histogram — separate price scale ── */
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat:  { type: "volume" },
      priceScaleId: "volume",
    } as Partial<HistogramSeriesOptions>);

    // Volume scale sits at the bottom 25% of the pane
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
      borderColor:  BORDER_COLOR,
    });

    chartRef.current  = chart;
    candleRef.current = candleSeries;
    areaRef.current   = areaSeries;
    volumeRef.current = volumeSeries;

    /* ── ResizeObserver ── */
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      chart.applyOptions({ width, height });
      chart.timeScale().fitContent();
    });
    ro.observe(el);

    /* ── Crosshair tooltip ── */
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        setTooltip(null);
        return;
      }

      const cs = candleSeries.dataByIndex(
        param.logical ?? 0
      ) as CandlestickData | undefined;

      if (!cs) { setTooltip(null); return; }

      // Translate unix timestamp → readable date
      const d    = new Date((cs.time as number) * 1000);
      const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

      // Find matching volume bar
      const volBar = data.find(b => b.time === (cs.time as number));

      setTooltip({
        time:   date,
        open:   cs.open,
        high:   cs.high,
        low:    cs.low,
        close:  cs.close,
        volume: volBar?.volume ?? 0,
        x:      param.point.x,
        y:      param.point.y,
      });
    });

    return () => {
      ro.disconnect();
      chart.unsubscribeClick(() => {});
      chart.remove();
      chartRef.current  = null;
      candleRef.current = null;
      areaRef.current   = null;
      volumeRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Update series data when data / period changes ───────────────────── */
  useEffect(() => {
    if (!candleRef.current || !areaRef.current || !volumeRef.current) return;
    if (!data.length) return;

    const sliced = slicePeriod(data, period);
    if (!sliced.length) return;

    candleRef.current.setData(toCandles(sliced));
    areaRef.current.setData(toArea(sliced));
    volumeRef.current.setData(toVolume(sliced));

    chartRef.current?.timeScale().fitContent();
  }, [data, period]);

  /* ── Toggle chart type ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!candleRef.current || !areaRef.current) return;
    candleRef.current.applyOptions({ visible: chartType === "candle" });
    areaRef.current.applyOptions({  visible: chartType === "area"   });
  }, [chartType]);

  /* ── Handlers ────────────────────────────────────────────────────────── */
  const handleTypeToggle = useCallback((t: ChartType) => setChartType(t), []);
  const handlePeriod     = useCallback((p: Period)    => setPeriod(p),    []);

  /* ── Loading state ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <div className={styles.skeletonPill} style={{ width: 120 }} />
          <div className={styles.skeletonPill} style={{ width: 200 }} />
        </div>
        <div className={styles.skeletonChart} aria-busy="true" aria-label="Loading chart…">
          {/* Shimmer bars */}
          {Array.from({ length: 28 }, (_, i) => (
            <div
              key={i}
              className={styles.skeletonBar}
              style={{
                height: `${30 + Math.sin(i * 0.7) * 22 + Math.cos(i * 0.4) * 18}%`,
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error state ─────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorState} role="alert">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  /* ── Empty state ─────────────────────────────────────────────────────── */
  if (!data.length) {
    return (
      <div className={styles.wrap}>
        <div className={styles.emptyState}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p>No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        {/* Chart type toggle */}
        <div className={styles.toggleGroup} role="group" aria-label="Chart type">
          <button
            id="chart-type-candle"
            className={`${styles.toggleBtn} ${chartType === "candle" ? styles.active : ""}`}
            onClick={() => handleTypeToggle("candle")}
            title="Candlestick chart"
            aria-pressed={chartType === "candle"}
          >
            <CandleIcon />
            Candles
          </button>
          <button
            id="chart-type-area"
            className={`${styles.toggleBtn} ${chartType === "area" ? styles.active : ""}`}
            onClick={() => handleTypeToggle("area")}
            title="Area chart"
            aria-pressed={chartType === "area"}
          >
            <AreaIcon />
            Area
          </button>
        </div>

        {/* Symbol label */}
        {symbol && <span className={styles.symbolLabel}>{symbol}</span>}

        {/* Period selector */}
        <div className={styles.periodGroup} role="group" aria-label="Chart period">
          {PERIODS.map(p => (
            <button
              key={p}
              id={`chart-period-${p.toLowerCase()}`}
              className={`${styles.periodBtn} ${period === p ? styles.active : ""}`}
              onClick={() => handlePeriod(p)}
              aria-pressed={period === p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart canvas ── */}
      <div className={styles.canvas} ref={containerRef} aria-label="Stock price chart">
        {/* Crosshair tooltip overlay */}
        {tooltip && (
          <div
            className={styles.tooltip}
            style={{
              left: tooltip.x + 12,
              top:  Math.max(8, tooltip.y - 90),
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className={styles.tooltipDate}>{tooltip.time}</div>
            <div className={styles.tooltipGrid}>
              <span className={styles.tooltipLabel}>O</span>
              <span className={styles.tooltipValue}>
                {fmt(tooltip.open)}
              </span>
              <span className={styles.tooltipLabel}>H</span>
              <span className={`${styles.tooltipValue} ${styles.green}`}>
                {fmt(tooltip.high)}
              </span>
              <span className={styles.tooltipLabel}>L</span>
              <span className={`${styles.tooltipValue} ${styles.red}`}>
                {fmt(tooltip.low)}
              </span>
              <span className={styles.tooltipLabel}>C</span>
              <span
                className={`${styles.tooltipValue} ${
                  tooltip.close >= tooltip.open ? styles.green : styles.red
                }`}
              >
                {fmt(tooltip.close)}
              </span>
              <span className={styles.tooltipLabel}>V</span>
              <span className={styles.tooltipValue}>
                {fmtVol(tooltip.volume)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtVol(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

/* ─── Tiny inline SVG icons ─────────────────────────────────────────────── */

function CandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="1" y="3" width="3" height="8" rx="0.5" opacity="0.9" />
      <line x1="2.5" y1="1" x2="2.5" y2="3" stroke="currentColor" strokeWidth="1" />
      <line x1="2.5" y1="11" x2="2.5" y2="13" stroke="currentColor" strokeWidth="1" />
      <rect x="5.5" y="5" width="3" height="5" rx="0.5" opacity="0.6" />
      <line x1="7" y1="2" x2="7" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="7" y1="10" x2="7" y2="12" stroke="currentColor" strokeWidth="1" />
      <rect x="10" y="4" width="3" height="6" rx="0.5" opacity="0.9" />
      <line x1="11.5" y1="1.5" x2="11.5" y2="4" stroke="currentColor" strokeWidth="1" />
      <line x1="11.5" y1="10" x2="11.5" y2="12.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1 11 L4 7 L7 9 L10 4 L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 11 L4 7 L7 9 L10 4 L13 6 L13 13 L1 13 Z" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

export default memo(StockChart);
