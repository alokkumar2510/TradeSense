"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { createChart, ColorType, CrosshairMode, CandlestickSeries, LineSeries } from "lightweight-charts";
import { ArrowRight, Activity, ChevronRight, Shield, TrendingUp } from "lucide-react";

// The HeroChart component renders a real TradingView Lightweight Chart
function HeroChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6B7280",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.02)" },
        horzLines: { color: "rgba(255,255,255,0.02)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(0, 255, 163, 0.4)", width: 1, style: 0 },
        horzLine: { color: "rgba(0, 255, 163, 0.4)", width: 1, style: 0 },
      },
      rightPriceScale: {
        borderVisible: false,
        textColor: "#6B7280",
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      handleScroll: false,
      handleScale: false,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00FFA3",
      downColor: "#EF4444",
      borderVisible: false,
      wickUpColor: "#00FFA3",
      wickDownColor: "#EF4444",
    });

    // Generate realistic-looking dummy data for the showcase
    const data: { time: string; open: number; high: number; low: number; close: number }[] = [];
    let currentPrice = 2800;
    const today = new Date();
    for (let i = 180; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
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
    
    // Add a moving average line for visual complexity
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

export default function HeroSection() {
  const reduce = useReducedMotion();
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]; // cinematic ease out
  
  const fadeUp = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 1, delay, ease }
    };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 lg:pt-0 lg:pb-0 overflow-hidden bg-[#0B0F14]">
      
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#00FFA3]/10 via-[#3B82F6]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
      
      {/* High-end Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none [mask-image:radial-gradient(ellipse_at_left_center,black_20%,transparent_70%)]"
        style={{ 
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", 
          backgroundSize: "64px 64px" 
        }}
      />

      <div className="max-w-[90rem] mx-auto px-6 w-full relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT COLUMN: Typography & CTA */}
        <div className="flex flex-col items-start text-left max-w-2xl relative z-20">
          <motion.div {...fadeUp(0)} className="mb-8">
            <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md transition-all hover:bg-white/[0.08] hover:border-white/10 cursor-default shadow-lg shadow-black/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#00FFA3]"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFA3]"></span>
              </span>
              <span className="text-xs md:text-sm font-medium text-[#E6EDF3] tracking-wide">TradeSense Pro 2.0</span>
              <div className="w-px h-3 bg-white/10 mx-1" />
              <span className="text-xs md:text-sm text-[#9CA3AF] flex items-center gap-1 group-hover:text-white transition-colors">
                Available Now <ChevronRight size={14} />
              </span>
            </div>
          </motion.div>

          <motion.h1 
            {...fadeUp(0.1)} 
            className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-[-0.04em] mb-8 drop-shadow-2xl"
          >
            Analyse.<br/> Execute.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00FFA3] to-[#3B82F6]">Dominate.</span>
          </motion.h1>

          <motion.p 
            {...fadeUp(0.2)} 
            className="text-lg md:text-xl text-[#888888] mb-12 max-w-xl leading-relaxed font-light tracking-wide"
          >
            The ultimate trading command center. Blazing-fast charts, precise AI signals, and zero-latency portfolio tracking—engineered for the absolute edge.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <Link href="/dashboard" className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#0B0F14] font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <span className="relative z-10 flex items-center gap-2">
                Launch Terminal
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="#features" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-white/10 text-[#E6EDF3] font-medium rounded-xl hover:bg-white/5 hover:border-white/20 transition-all">
              Explore Platform
            </Link>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Bleeding Dashboard UI */}
        <div className="relative w-full h-full lg:h-screen lg:absolute lg:top-0 lg:right-0 lg:w-1/2 flex items-center pointer-events-none mt-12 lg:mt-0">
          <motion.div 
            className="w-full lg:w-[150%] max-w-[1200px] mx-auto lg:ml-auto rounded-2xl lg:rounded-l-2xl lg:rounded-r-2xl bg-[#06090E] border border-white/[0.08] shadow-[0_40px_100px_-20px_rgba(0,0,0,1),_0_0_40px_rgba(0,255,163,0.05)] overflow-hidden lg:translate-x-12 xl:translate-x-24 pointer-events-auto"
            initial={reduce ? {} : { opacity: 0, x: 50, rotateY: -10, rotateX: 5 }}
            animate={reduce ? {} : { opacity: 1, x: 0, rotateY: -5, rotateX: 2 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: "2000px", transformStyle: "preserve-3d" }}
          >
            {/* Glossy Top Edge */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-30" />
            
            {/* macOS Style Header */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.04] bg-[#0B0F14]/90 backdrop-blur-md relative z-20">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444] border border-[#EF4444]/20" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B] border border-[#F59E0B]/20" />
                <div className="w-3 h-3 rounded-full bg-[#10B981] border border-[#10B981]/20" />
              </div>
              <div className="flex-1 flex justify-center lg:pr-24">
                <div className="flex items-center gap-2 px-12 py-1 rounded-md bg-black/40 border border-white/[0.05] shadow-inner text-xs text-[#6B7280] font-mono tracking-wide">
                  <Shield size={12} className="text-[#14B8A6]" />
                  secure.tradesense.pro
                </div>
              </div>
            </div>

            {/* Application Interface */}
            <div className="grid lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04] bg-[#0B0F14]/50">
              
              {/* Main Chart Area */}
              <div className="p-6 flex flex-col relative h-[500px] lg:h-[650px]">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-3xl font-black text-white tracking-tight">RELIANCE</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]">NSE</span>
                    </div>
                    <p className="text-xs text-[#6B7280] font-medium">Reliance Industries Ltd.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1 font-mono tracking-tight">₹2,847.60</div>
                    <div className="flex items-center justify-end gap-1 text-[#00FFA3] font-bold text-[11px] bg-[#00FFA3]/10 border border-[#00FFA3]/20 px-2 py-1 rounded inline-flex">
                      <TrendingUp size={12} /> +38.45 (+1.37%)
                    </div>
                  </div>
                </div>

                <div className="relative border border-white/[0.06] rounded-xl overflow-hidden bg-[#0A0D14] shadow-inner flex-1">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  <HeroChart />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="p-6 bg-[#0B0F14]/40 flex flex-col gap-5 h-[500px] lg:h-[650px] overflow-hidden">
                
                {/* AI Signal */}
                <div className="relative bg-gradient-to-b from-[#00FFA3]/5 to-transparent rounded-xl p-5 border border-[#00FFA3]/10 overflow-hidden shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
                      <Activity size={12} className="text-[#00FFA3]" /> AI Signal
                    </span>
                  </div>
                  <div className="text-center mb-5">
                    <div className="text-2xl font-black text-[#00FFA3] tracking-tight mb-1.5">STRONG BUY</div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[10px] text-[#00FFA3] font-mono font-bold">
                      CONFIDENCE: 86%
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-[11px] mb-1.5">
                        <span className="text-[#9CA3AF] font-medium">RSI (14)</span>
                        <span className="font-mono font-bold text-white">42.5</span>
                      </div>
                      <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00FFA3] to-[#3B82F6] w-[42.5%]" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-2.5 border-t border-white/[0.04]">
                      <span className="text-[#9CA3AF] font-medium">MACD</span>
                      <span className="text-[#00FFA3] font-bold">BULLISH</span>
                    </div>
                  </div>
                </div>

                {/* News */}
                <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 flex flex-col min-h-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4 shrink-0">Live News</div>
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { title: "Q4 Results beat estimates by 12%", time: "10m ago", color: "#00FFA3" },
                      { title: "FIIs increase stake in energy", time: "1h ago", color: "#00FFA3" },
                      { title: "Global markets show volatility", time: "3h ago", color: "#F59E0B" },
                      { title: "New acquisition announced", time: "5h ago", color: "#3B82F6" },
                      { title: "Sector outlook upgraded", time: "1d ago", color: "#E6EDF3" }
                    ].map((news, i) => (
                      <div key={i} className="flex gap-2.5 group">
                        <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: news.color }} />
                        <div>
                          <p className="text-[11px] leading-snug text-[#E6EDF3] font-medium mb-0.5">{news.title}</p>
                          <p className="text-[9px] text-[#6B7280] font-mono">{news.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
      
      {/* Fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0B0F14] to-transparent pointer-events-none z-30" />
    </section>
  );
}


