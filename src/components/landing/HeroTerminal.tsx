"use client";
import { useEffect, useRef } from "react";
import { Activity, Shield, TrendingUp } from "lucide-react";
import { createChart, ColorType, CandlestickSeries, LineSeries, CrosshairMode } from "lightweight-charts";

function HeroChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const c = createChart(ref.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#6B7280", fontFamily: "Inter, sans-serif", fontSize: 10 },
      grid: { vertLines: { color: "rgba(255,255,255,0.03)" }, horzLines: { color: "rgba(255,255,255,0.03)" } },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: "rgba(0,255,163,0.4)", width: 1, style: 0 }, horzLine: { color: "rgba(0,255,163,0.4)", width: 1, style: 0 } },
      rightPriceScale: { borderVisible: false }, timeScale: { borderVisible: false, timeVisible: true },
      handleScroll: false, handleScale: false,
    });
    const cs = c.addSeries(CandlestickSeries, { upColor: "#00FFA3", downColor: "#EF4444", borderVisible: false, wickUpColor: "#00FFA3", wickDownColor: "#EF4444" });
    const data: { time: string; open: number; high: number; low: number; close: number }[] = [];
    let price = 2800; const today = new Date();
    for (let i = 120; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const o = price, h = o + Math.random() * 40, l = o - Math.random() * 40, cl = l + Math.random() * (h - l);
      data.push({ time: d.toISOString().split("T")[0], open: o, high: h, low: l, close: cl }); price = cl;
    }
    cs.setData(data);
    const ma = c.addSeries(LineSeries, { color: "rgba(59,130,246,0.5)", lineWidth: 2, crosshairMarkerVisible: false });
    ma.setData(data.map((d, i) => { let s = 0; for (let j = Math.max(0, i - 19); j <= i; j++) s += data[j].close; return { time: d.time, value: s / Math.min(i + 1, 20) }; }));
    c.timeScale().fitContent();
    const resize = () => { if (ref.current) c.applyOptions({ width: ref.current.clientWidth }); };
    window.addEventListener("resize", resize); setTimeout(resize, 50);
    return () => { window.removeEventListener("resize", resize); c.remove(); };
  }, []);
  return <div ref={ref} className="w-full h-full" />;
}

export default function HeroTerminal() {
  return (
    <div className="relative w-full">
      {/* Main terminal card */}
      <div className="bg-[#111827]/90 border border-white/[0.07] rounded-2xl overflow-hidden backdrop-blur-xl shadow-[0_8px_60px_rgba(0,0,0,0.6)]">
        {/* Chrome bar */}
        <div className="h-10 px-4 border-b border-white/5 bg-[#0B0F14]/90 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80" />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
            <Shield size={10} className="text-[#14B8A6]" /> secure.tradesense.pro
          </div>
          <div className="w-8" />
        </div>

        {/* Terminal body */}
        <div className="showcase-grid">
          {/* Chart panel */}
          <div className="p-4 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  RELIANCE <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">NSE</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Reliance Industries Ltd.</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-bold">₹2,847.60</div>
                <div className="text-[10px] text-[#00FFA3] flex items-center gap-1 mt-0.5">
                  <TrendingUp size={10} /> +38.45 (1.37%)
                </div>
              </div>
            </div>
            <div className="h-44 lg:h-56 rounded-xl bg-[#0A0D14] border border-white/5 overflow-hidden relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:36px_36px]" />
              <HeroChart />
            </div>
          </div>

          {/* Sidebar */}
          <div className="p-3 bg-[#0B0F14]/60 space-y-2.5 border-t md:border-t-0 md:border-l border-white/5">
            <div className="rounded-xl p-3 border border-[#00FFA3]/15 bg-gradient-to-b from-[#00FFA3]/5 to-transparent">
              <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1.5">
                <Activity size={10} className="text-[#00FFA3]" /> AI Signal
              </div>
              <div className="text-[#00FFA3] font-black text-base">STRONG BUY</div>
              <div className="text-[9px] font-mono text-zinc-500 mt-1">CONFIDENCE: 86%</div>
              <div className="w-full h-1 rounded-full bg-black/40 mt-2 overflow-hidden">
                <div className="h-full w-[86%] bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]" />
              </div>
            </div>
            <div className="rounded-xl p-3 border border-white/[0.07] bg-white/[0.02] space-y-2">
              <div className="text-[9px] uppercase tracking-widest text-zinc-500">Positions</div>
              {[{ s: "TCS", v: "+₹3.2k", g: true }, { s: "INFY", v: "-₹1.1k", g: false }, { s: "HDFC", v: "+₹5.4k", g: true }].map(r => (
                <div key={r.s} className="flex justify-between text-[11px]">
                  <span className="font-mono text-zinc-300">{r.s}</span>
                  <span className={r.g ? "text-[#00FFA3] font-semibold" : "text-[#EF4444] font-semibold"}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 border border-white/[0.07] bg-white/[0.02]">
              <div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Net P&L Today</div>
              <div className="text-lg font-bold text-[#00FFA3] font-mono">+₹7,540</div>
              <div className="text-[9px] text-zinc-500">After STT & charges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating latency badge */}
      <div className="hidden lg:block absolute -left-8 -bottom-4 w-40 rounded-xl border border-white/10 bg-[#0B0F14]/95 backdrop-blur-xl p-3 shadow-2xl">
        <p className="text-[9px] uppercase tracking-widest text-zinc-500">Latency</p>
        <p className="text-xl font-bold mt-0.5">13ms</p>
        <p className="text-[10px] text-zinc-500">Realtime NSE</p>
      </div>

      {/* Floating signal badge */}
      <div className="hidden lg:block absolute -right-6 -top-4 w-44 rounded-xl border border-[#00FFA3]/15 bg-[#0B0F14]/95 backdrop-blur-xl p-3 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute h-full w-full rounded-full opacity-75 bg-[#00FFA3]" />
            <span className="relative rounded-full h-2 w-2 bg-[#00FFA3]" />
          </span>
          <span className="text-[9px] uppercase tracking-widest text-zinc-400">Live Signal</span>
        </div>
        <div className="text-sm font-bold text-white">HDFC Bank</div>
        <div className="text-[10px] text-[#00FFA3] font-mono">BUY · 92% conf.</div>
      </div>
    </div>
  );
}
