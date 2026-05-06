"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { createChart, ColorType, CrosshairMode, CandlestickSeries, LineSeries } from "lightweight-charts";
import { Briefcase, TrendingUp, Shield, Activity, Globe } from "lucide-react";

function MainShowcaseChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6B7280",
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.02)" },
        horzLines: { color: "rgba(255,255,255,0.02)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#3B82F6", width: 1, style: 3, labelBackgroundColor: "#3B82F6" },
        horzLine: { color: "#3B82F6", width: 1, style: 3, labelBackgroundColor: "#3B82F6" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00FFA3",
      downColor: "#EF4444",
      borderVisible: false,
      wickUpColor: "rgba(0, 255, 163, 0.4)",
      wickDownColor: "rgba(239, 68, 68, 0.4)",
    });

    // Realistic-looking data
    const data: { time: string; open: number; high: number; low: number; close: number }[] = [];
    let currentPrice = 2800;
    const today = new Date();
    for (let i = 180; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const open = currentPrice;
      const high = open + Math.random() * 40;
      const low = open - Math.random() * 40;
      const close = low + Math.random() * (high - low);
      data.push({
        time: date.toISOString().split("T")[0],
        open, high, low, close
      });
      currentPrice = close;
    }
    candlestickSeries.setData(data);
    
    // Add moving average
    const maSeries = chart.addSeries(LineSeries, {
      color: 'rgba(59, 130, 246, 0.5)',
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    
    const maData = data.map((d, index) => {
      const period = 20;
      let sum = 0;
      for (let i = Math.max(0, index - period + 1); i <= index; i++) {
        sum += data[i].close;
      }
      const count = Math.min(index + 1, period);
      return { time: d.time, value: sum / count };
    });
    maSeries.setData(maData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    setTimeout(() => handleResize(), 50);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[300px]" />;
}

export default function ProductPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start center"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <section id="preview" ref={containerRef} className="py-24 lg:py-32 relative bg-[#0B0F14] overflow-hidden" style={{ perspective: "1200px" }}>
      
      {/* Background Layering */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#00FFA3]/5 to-[#3B82F6]/10 blur-[150px] rounded-[100%] opacity-80 mix-blend-screen" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 lg:mb-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
              <Globe size={12} className="text-[#00FFA3]" />
              <span className="text-[11px] font-bold text-[#E6EDF3] tracking-widest uppercase">The Terminal</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Institutional-grade analysis.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] drop-shadow-sm">Built for retail.</span>
            </h2>
            <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
              Experience the market like never before. Combining advanced charting, proprietary AI signaling, and real-time portfolio management in a unified command center.
            </p>
          </motion.div>
        </div>

        {/* The Giant Showcase Terminal */}
        <motion.div 
          className="relative rounded-[24px] bg-[#06090E] border border-white/[0.08] overflow-hidden transform-gpu"
          style={reduce ? {} : { rotateX, scale, opacity, boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8), 0 0 40px rgba(0,255,163,0.05)" }}
          transition={{ duration: 0.8, ease }}
        >
          {/* Top Bar - macOS style */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.04] bg-[#0B0F14]/90 backdrop-blur-md relative z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444] border border-[#EF4444]/20 shadow-inner" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B] border border-[#F59E0B]/20 shadow-inner" />
              <div className="w-3 h-3 rounded-full bg-[#10B981] border border-[#10B981]/20 shadow-inner" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-32 py-1 rounded-md bg-black/40 border border-white/[0.05] shadow-inner text-xs text-[#6B7280] font-mono tracking-wide">
                <Shield size={12} className="text-[#14B8A6]" />
                secure.tradesense.pro
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
                <span className="text-[10px] text-[#00FFA3] font-bold tracking-widest uppercase">Live</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04] bg-gradient-to-b from-[#0B0F14]/50 to-transparent">
            
            {/* Left: Chart & Stats */}
            <div className="p-6 lg:p-8 flex flex-col relative">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#3B82F6]/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-4xl font-black text-white tracking-tight">RELIANCE</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]">NSE</span>
                  </div>
                  <p className="text-sm text-[#6B7280] font-medium">Reliance Industries Ltd.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-white mb-2 font-mono tracking-tight">₹2,847.60</div>
                  <div className="flex items-center justify-end gap-1.5 text-[#00FFA3] font-bold text-sm bg-[#00FFA3]/10 border border-[#00FFA3]/20 px-2 py-1 rounded-md inline-flex">
                    <TrendingUp size={14} /> +38.45 (+1.37%)
                  </div>
                </div>
              </div>

              {/* OHLCV Summary */}
              <div className="grid grid-cols-5 gap-4 mb-8 relative z-10">
                {[
                  { label: "Open", value: "2,815.00" },
                  { label: "High", value: "2,862.30" },
                  { label: "Low", value: "2,808.10" },
                  { label: "Vol", value: "4.2M" },
                  { label: "Mkt Cap", value: "19.3L Cr" }
                ].map(stat => (
                  <div key={stat.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] backdrop-blur-sm">
                    <div className="text-[11px] text-[#6B7280] font-medium uppercase tracking-widest mb-1.5">{stat.label}</div>
                    <div className="text-sm font-mono font-semibold text-[#E6EDF3] tracking-wide">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Actual Chart */}
              <div className="relative border border-white/[0.06] rounded-2xl overflow-hidden bg-[#0A0D14] shadow-inner flex-1 min-h-[400px]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <MainShowcaseChart />
              </div>
            </div>

            {/* Right: Signal & Portfolio Sync */}
            <div className="p-6 lg:p-8 bg-[#0B0F14]/40 flex flex-col gap-6 relative z-10">
              
              {/* Signal Block */}
              <div className="relative bg-gradient-to-b from-[#00FFA3]/5 to-transparent rounded-2xl p-6 border border-[#00FFA3]/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFA3]/10 blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
                    <Activity size={14} className="text-[#00FFA3]" />
                    AI Signal
                  </span>
                </div>
                <div className="text-center mb-8">
                  <div className="text-3xl font-black text-[#00FFA3] tracking-tight mb-2 drop-shadow-[0_0_10px_rgba(0,255,163,0.3)]">STRONG BUY</div>
                  <div className="inline-block px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[11px] text-[#00FFA3] font-mono font-bold tracking-wide">
                    CONFIDENCE: 86%
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-[#9CA3AF] font-medium">RSI (14)</span>
                      <span className="font-mono font-bold text-white tracking-wide">42.5</span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/[0.05]">
                      <div className="h-full bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] w-[42.5%] shadow-[0_0_10px_rgba(0,255,163,0.5)]" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-white/[0.04]">
                    <span className="text-[#9CA3AF] font-medium">MACD (12,26,9)</span>
                    <span className="text-[#00FFA3] font-bold px-2 py-1 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded shadow-sm">BULLISH</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9CA3AF] font-medium">Trend</span>
                    <span className="text-[#00FFA3] font-bold px-2 py-1 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded shadow-sm">ABOVE MA20</span>
                  </div>
                </div>
              </div>

              {/* Position Block */}
              <div className="bg-[#0A0D14] rounded-2xl p-6 border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
                    <Briefcase size={14} className="text-[#3B82F6]" />
                    Your Position
                  </span>
                </div>
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <div className="text-[11px] text-[#6B7280] font-medium uppercase tracking-widest mb-1.5">Qty</div>
                    <div className="text-2xl font-mono font-bold text-white tracking-tight">150</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#6B7280] font-medium uppercase tracking-widest mb-1.5">Unrealized P&L</div>
                    <div className="text-2xl font-mono font-bold text-[#00FFA3] tracking-tight drop-shadow-[0_0_8px_rgba(0,255,163,0.3)]">+₹14,280</div>
                  </div>
                </div>
                <div className="w-full pt-4 border-t border-white/[0.04] flex justify-between items-center text-xs">
                  <span className="text-[#6B7280] font-medium">Avg Cost</span>
                  <span className="font-mono font-bold text-white tracking-wide">₹2,752.40</span>
                </div>
              </div>

              {/* Market News */}
              <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-5">Live News</div>
                <div className="space-y-4">
                  {[
                    { title: "Q4 Results beat street estimates by 12%", time: "10m ago", color: "#00FFA3" },
                    { title: "FIIs increase stake in energy sector", time: "1h ago", color: "#00FFA3" },
                    { title: "Global markets show mild volatility", time: "3h ago", color: "#F59E0B" }
                  ].map((news, i) => (
                    <div key={i} className="flex gap-3 group cursor-pointer">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-[0_0_5px_currentColor] transition-transform group-hover:scale-150" style={{ backgroundColor: news.color, color: news.color }} />
                      <div>
                        <p className="text-xs text-[#E6EDF3] leading-relaxed font-medium mb-1 group-hover:text-white transition-colors">{news.title}</p>
                        <p className="text-[10px] text-[#6B7280] font-mono">{news.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
