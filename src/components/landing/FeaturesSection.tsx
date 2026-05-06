"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Zap, BarChart2, Briefcase, Calculator, Shield, Lock, Activity } from "lucide-react";

/* ─── Mini UI Fragments for Bento Boxes ──────────────────────── */

function MiniCandles() {
  const data = [
    [70,60,72,57,false],[60,68,70,58,true],[68,65,71,63,false],
    [65,75,78,64,true],[75,72,78,70,false],[72,82,85,71,true],
    [82,88,91,80,true],[88,84,90,82,false],
    [84,92,95,80,true],[92,86,94,82,false],
    [86,80,88,78,false],[80,85,90,75,true],
    [85,90,92,82,true],[90,84,91,81,false],
    [84,95,98,82,true],[95,88,96,85,false],
    [88,82,90,80,false],[82,89,92,78,true],
    [89,98,102,88,true],[98,94,100,90,false],
    [94,105,108,92,true],[105,112,115,100,true],
  ] as [number,number,number,number,boolean][];
  
  const H = 160, max = 120, min = 50, range = max - min;
  const yv = (v: number) => H - ((v - min) / range) * H;
  const W = 10, G = 8;
  
  return (
    <div className="w-full h-full flex items-end justify-center overflow-hidden opacity-90 p-6">
      <svg width={data.length*(W+G)} height={H+20} viewBox={`0 0 ${data.length*(W+G)} ${H+20}`} preserveAspectRatio="xMidYMax meet" className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        {data.map(([o,c,h,l,bull],i) => {
          const x = i*(W+G), col = bull ? "#00FFA3" : "#EF4444";
          const top = yv(Math.max(o,c)), ht = Math.abs(yv(o)-yv(c)) || 2;
          return (
            <g key={i} className="transition-all duration-300 hover:opacity-100 cursor-crosshair">
              <line x1={x+W/2} y1={yv(h)} x2={x+W/2} y2={yv(l)} stroke={col} strokeWidth="1.5" strokeOpacity="0.4" />
              <rect x={x} y={top} width={W} height={ht} fill={col} fillOpacity="0.9" rx="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SignalPreview() {
  const value = 42;
  const filled = (value / 100) * 126;
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative mb-4">
        <svg width="140" height="80" viewBox="0 0 80 48" aria-hidden className="drop-shadow-[0_0_15px_rgba(0,255,163,0.3)]">
          <path d="M 6 44 A 34 34 0 0 1 74 44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 6 44 A 34 34 0 0 1 74 44" fill="none" stroke="#00FFA3" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${filled} 126`} />
          <text x="40" y="40" textAnchor="middle" fill="#E6EDF3" fontSize="18" fontWeight="900" fontFamily="monospace" letterSpacing="-1">{value}</text>
        </svg>
      </div>
      <div className="w-full space-y-3 px-6 pb-6">
        <div className="flex justify-between items-center text-[11px] border-t border-white/[0.05] pt-3">
          <span className="text-[#9CA3AF] font-medium tracking-wide">MACD (12,26,9)</span>
          <span className="text-[#00FFA3] font-bold px-2 py-0.5 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded tracking-widest">BULLISH</span>
        </div>
        <div className="flex justify-between items-center text-[11px] border-t border-white/[0.05] pt-3">
          <span className="text-[#9CA3AF] font-medium tracking-wide">Trend</span>
          <span className="text-[#00FFA3] font-bold px-2 py-0.5 bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded tracking-widest">ABOVE MA20</span>
        </div>
      </div>
    </div>
  );
}

function TaxBreakdown() {
  const rows = [
    { l:"Buy value",  v:"₹1,00,000"           },
    { l:"Brokerage",  v:"−₹40"                },
    { l:"STT",        v:"−₹115"               },
    { l:"GST+Stamp",  v:"−₹28"                },
    { l:"STCG 15%",   v:"−₹2,213"             },
    { l:"Net Profit", v:"₹12,604", hi: true   },
  ];
  return (
    <div className="space-y-3 w-full px-6 pb-6 pt-4">
      {rows.map(r => (
        <div
          key={r.l}
          className="flex justify-between items-center text-sm"
          style={{ borderTop: r.hi ? "1px dashed rgba(255,255,255,0.1)" : "none", paddingTop: r.hi ? 12 : 0, marginTop: r.hi ? 12 : 0 }}
        >
          <span style={{ color: r.hi ? "#E6EDF3" : "#9CA3AF" }} className={r.hi ? "font-bold" : "font-medium text-xs"}>{r.l}</span>
          <span className={`font-mono tracking-wide ${r.hi ? 'font-bold' : 'text-xs'}`} style={{ color: r.hi ? (r.v.startsWith('−') ? "#EF4444" : "#00FFA3") : "#9CA3AF" }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

function PortfolioBars() {
  const holdings = [
    { sym:"RELIANCE", pct:78, val:"+₹8.4k", bull:true  },
    { sym:"TCS",      pct:55, val:"+₹3.2k", bull:true  },
    { sym:"INFY",     pct:34, val:"−₹1.1k", bull:false },
  ];
  return (
    <div className="space-y-5 w-full px-6 py-4">
      {holdings.map((h, i) => (
        <motion.div 
          key={h.sym}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold font-mono text-[#E6EDF3] tracking-wide">{h.sym}</span>
            <span className="text-xs font-bold tracking-wide" style={{ color: h.bull ? "#00FFA3" : "#EF4444" }}>{h.val}</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/40 overflow-hidden border border-white/[0.05]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: h.bull ? "linear-gradient(90deg,#00FFA3,#3B82F6)" : "#EF4444", boxShadow: h.bull ? "0 0 15px rgba(0,255,163,0.3)" : "none" }}
              initial={{ width: 0 }}
              whileInView={{ width: `${h.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (i*0.1) }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────── */
export default function FeaturesSection() {
  const reduce = useReducedMotion();

  return (
    <section id="features" className="py-32 lg:py-48 relative bg-[#0B0F14] overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#00FFA3]/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-[#3B82F6]/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Editorial Header */}
        <motion.div
          className="mb-16 lg:mb-24 flex flex-col items-center text-center max-w-3xl mx-auto"
          initial={reduce ? false : { opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]" />
            <span className="text-xs font-bold text-[#E6EDF3] tracking-widest uppercase">Platform Architecture</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6 drop-shadow-lg">
            Built for those who demand <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9CA3AF] to-[#4B5563]">the absolute best.</span>
          </h2>
          <p className="text-lg md:text-xl text-[#9CA3AF] leading-relaxed font-light">
            We stripped away the noise of traditional terminals, leaving only highly actionable data, crystal clear charts, and automated profit math.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-[400px]">
          
          {/* Box 1: Charting (Col 8) */}
          <motion.div 
            className="md:col-span-8 group relative rounded-[2rem] bg-[#121826]/40 border border-white/[0.05] overflow-hidden flex flex-col hover:bg-[#121826]/60 transition-colors"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-8 lg:p-10 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] mb-6">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">TradingView Integration</h3>
              <p className="text-[#9CA3AF] max-w-md leading-relaxed text-sm">
                Pixel-perfect dark mode charting. 180 days of highly accurate OHLCV data rendered at 60fps directly in your browser.
              </p>
            </div>
            <div className="mt-auto relative h-48 border-t border-white/[0.03] bg-[#0A0D14]/80">
              <MiniCandles />
            </div>
          </motion.div>

          {/* Box 2: AI Consensus (Col 4) */}
          <motion.div 
            className="md:col-span-4 group relative rounded-[2rem] bg-[#121826]/40 border border-white/[0.05] overflow-hidden flex flex-col hover:bg-[#121826]/60 transition-colors"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-8 lg:p-10 z-10 pb-0">
              <div className="w-12 h-12 rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center text-[#00FFA3] mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Consensus</h3>
              <p className="text-[#9CA3AF] leading-relaxed text-sm">
                Proprietary AI engine fuses RSI, MACD, and Moving Averages into a definitive signal score.
              </p>
            </div>
            <div className="mt-auto relative pt-4 flex-1 flex flex-col justify-end">
              <SignalPreview />
            </div>
          </motion.div>

          {/* Box 3: Tax Automation (Col 4) */}
          <motion.div 
            className="md:col-span-4 group relative rounded-[2rem] bg-[#121826]/40 border border-white/[0.05] overflow-hidden flex flex-col hover:bg-[#121826]/60 transition-colors"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-8 lg:p-10 z-10 pb-0">
              <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-6">
                <Calculator size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Automated Taxes</h3>
              <p className="text-[#9CA3AF] leading-relaxed text-sm">
                Every calculation includes SEBI-compliant deductions for STT, Brokerage, and Capital Gains.
              </p>
            </div>
            <div className="mt-auto relative bg-[#0A0D14]/80 border-t border-white/[0.03]">
              <TaxBreakdown />
            </div>
          </motion.div>

          {/* Box 4: Portfolio (Col 8) */}
          <motion.div 
            className="md:col-span-8 group relative rounded-[2rem] bg-[#121826]/40 border border-white/[0.05] overflow-hidden flex flex-col md:flex-row hover:bg-[#121826]/60 transition-colors"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-8 lg:p-10 z-10 md:w-1/2 flex flex-col justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Live Portfolio</h3>
              <p className="text-[#9CA3AF] leading-relaxed text-sm">
                Track your asset allocation with precise FIFO cost basis. Unrealised P&L recalculates instantly as market data streams in.
              </p>
            </div>
            <div className="md:w-1/2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/[0.03] bg-[#0A0D14]/80">
              <PortfolioBars />
            </div>
          </motion.div>

          {/* Box 5: Security (Col 12 - Full Width) */}
          <motion.div 
            className="md:col-span-12 group relative rounded-[2rem] bg-gradient-to-br from-[#14B8A6]/10 to-[#0A0D14] border border-[#14B8A6]/20 overflow-hidden flex flex-col lg:flex-row items-center lg:px-12 py-12 lg:py-16 shadow-[inset_0_0_80px_rgba(20,184,166,0.05)] hover:border-[#14B8A6]/30 transition-colors"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left mb-10 lg:mb-0 px-8 lg:px-0 z-10">
              <div className="w-16 h-16 rounded-[2rem] bg-[#14B8A6]/10 border border-[#14B8A6]/30 flex items-center justify-center text-[#14B8A6] mb-6 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                <Shield size={32} />
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">Zero Key Exposure.</h3>
              <p className="text-[#9CA3AF] leading-relaxed">
                An impregnable fortress for your API credentials. Your keys live strictly within Cloudflare Workers, ensuring your browser never touches a raw credential.
              </p>
            </div>
            <div className="lg:w-2/3 w-full flex flex-col sm:flex-row gap-4 px-8 z-10">
               {[
                 { icon: Lock, title: "Cloudflare Secured", desc: "Edge-computed proxy layer" },
                 { icon: Shield, title: "Client Isolated", desc: "No keys in local storage" },
                 { icon: Activity, title: "Encrypted Transit", desc: "End-to-end TLS 1.3" }
               ].map((item, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center text-center p-6 rounded-2xl bg-[#0B0F14]/80 border border-white/[0.05] backdrop-blur-md">
                   <item.icon size={24} className="text-[#14B8A6] mb-3" />
                   <h4 className="text-white text-sm font-bold mb-1">{item.title}</h4>
                   <p className="text-[#6B7280] text-xs">{item.desc}</p>
                 </div>
               ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
