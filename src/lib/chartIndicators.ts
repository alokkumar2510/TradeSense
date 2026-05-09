import type { OHLCVBar } from "@/types";
import type { UTCTimestamp } from "lightweight-charts";

type Pt = { time: UTCTimestamp; value: number };

export function ema(bars: OHLCVBar[], period: number): Pt[] {
  const k = 2 / (period + 1); let e = 0;
  return bars.reduce<Pt[]>((acc, b, i) => {
    e = i === 0 ? b.close : b.close * k + e * (1 - k);
    if (i >= period - 1) acc.push({ time: b.time as UTCTimestamp, value: e });
    return acc;
  }, []);
}

export function vwap(bars: OHLCVBar[]): Pt[] {
  let cumPV = 0, cumV = 0;
  return bars.map(b => {
    const tp = (b.high + b.low + b.close) / 3;
    cumPV += tp * b.volume; cumV += b.volume;
    return { time: b.time as UTCTimestamp, value: cumV > 0 ? cumPV / cumV : tp };
  });
}

export function bollingerBands(bars: OHLCVBar[], period = 20, mult = 2) {
  const upper: Pt[] = [], lower: Pt[] = [], mid: Pt[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    const sl = bars.slice(i - period + 1, i + 1).map(b => b.close);
    const mn = sl.reduce((a, v) => a + v, 0) / period;
    const sd = Math.sqrt(sl.reduce((a, v) => a + (v - mn) ** 2, 0) / period);
    const t = bars[i].time as UTCTimestamp;
    upper.push({ time: t, value: mn + mult * sd });
    lower.push({ time: t, value: mn - mult * sd });
    mid.push({ time: t, value: mn });
  }
  return { upper, lower, mid };
}

export function rsiSeries(bars: OHLCVBar[], period = 14): Pt[] {
  const out: Pt[] = [];
  if (bars.length < period + 1) return out;
  let avgG = 0, avgL = 0;
  for (let i = 1; i <= period; i++) {
    const d = bars[i].close - bars[i - 1].close;
    d > 0 ? (avgG += d) : (avgL -= d);
  }
  avgG /= period; avgL /= period;
  for (let i = period; i < bars.length; i++) {
    if (i > period) {
      const d = bars[i].close - bars[i - 1].close;
      avgG = (avgG * (period - 1) + Math.max(d, 0)) / period;
      avgL = (avgL * (period - 1) + Math.max(-d, 0)) / period;
    }
    out.push({ time: bars[i].time as UTCTimestamp, value: avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL) });
  }
  return out;
}

export function macdSeries(bars: OHLCVBar[]) {
  const e12 = ema(bars, 12), e26 = ema(bars, 26);
  const off = e12.length - e26.length;
  const macd = e26.map((v, i) => ({ time: v.time, value: e12[i + off].value - v.value }));
  let sv = 0; const k = 2 / 10;
  const sig = macd.reduce<Pt[]>((acc, m, i) => {
    sv = i === 0 ? m.value : m.value * k + sv * (1 - k);
    if (i >= 8) acc.push({ time: m.time, value: sv });
    return acc;
  }, []);
  const off2 = macd.length - sig.length;
  const hist = sig.map((s, i) => {
    const h = macd[i + off2].value - s.value;
    return { time: s.time, value: h, color: h >= 0 ? "#10B981" : "#EF4444" };
  });
  return { macd, sig, hist };
}

export function momentumSeries(bars: OHLCVBar[], period = 10): Pt[] {
  return bars.slice(period).map((b, i) => ({
    time: b.time as UTCTimestamp,
    value: ((b.close - bars[i].close) / bars[i].close) * 100,
  }));
}

export function stochasticSeries(bars: OHLCVBar[], k = 14, d = 3) {
  const kLine: Pt[] = [];
  for (let i = k - 1; i < bars.length; i++) {
    const sl = bars.slice(i - k + 1, i + 1);
    const lo = Math.min(...sl.map(b => b.low));
    const hi = Math.max(...sl.map(b => b.high));
    const val = hi === lo ? 50 : ((bars[i].close - lo) / (hi - lo)) * 100;
    kLine.push({ time: bars[i].time as UTCTimestamp, value: val });
  }
  const kMa = 2 / (d + 1); let ks = 0;
  const dLine = kLine.reduce<Pt[]>((acc, p, i) => {
    ks = i === 0 ? p.value : p.value * kMa + ks * (1 - kMa);
    if (i >= d - 1) acc.push({ time: p.time, value: ks });
    return acc;
  }, []);
  return { k: kLine, d: dLine };
}

export function supportResistanceLevels(bars: OHLCVBar[], lookback = 20, threshold = 0.015) {
  const levels: { price: number; type: "support" | "resistance"; strength: number }[] = [];
  for (let i = lookback; i < bars.length - lookback; i++) {
    const window = bars.slice(i - lookback, i + lookback + 1);
    const hi = Math.max(...window.map(b => b.high));
    const lo = Math.min(...window.map(b => b.low));
    if (Math.abs(bars[i].high - hi) / hi < 0.001) {
      const existing = levels.find(l => l.type === "resistance" && Math.abs(l.price - bars[i].high) / l.price < threshold);
      if (existing) existing.strength++;
      else levels.push({ price: bars[i].high, type: "resistance", strength: 1 });
    }
    if (Math.abs(bars[i].low - lo) / lo < 0.001) {
      const existing = levels.find(l => l.type === "support" && Math.abs(l.price - bars[i].low) / l.price < threshold);
      if (existing) existing.strength++;
      else levels.push({ price: bars[i].low, type: "support", strength: 1 });
    }
  }
  return levels.filter(l => l.strength >= 2).sort((a, b) => b.strength - a.strength).slice(0, 6);
}

export function toHeikinAshi(bars: OHLCVBar[]): OHLCVBar[] {
  return bars.map((b, i, a) => {
    const haC = (b.open + b.high + b.low + b.close) / 4;
    const haO = i === 0 ? (b.open + b.close) / 2 : (a[i - 1].open + a[i - 1].close) / 2;
    return { ...b, open: haO, high: Math.max(b.high, haO, haC), low: Math.min(b.low, haO, haC), close: haC };
  });
}
