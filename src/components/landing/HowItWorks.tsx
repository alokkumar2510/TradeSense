"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Search, LineChart, Zap, Wallet, ArrowRight } from "lucide-react";

const steps = [
  {
    id: "01",
    icon: Search,
    accent: "#00FFA3",
    title: "Instant Global Discovery",
    desc: "Type any symbol. Our edge-optimized autocomplete instantly queries NSE and BSE simultaneously.",
    metric: "< 50ms latency"
  },
  {
    id: "02",
    icon: LineChart,
    accent: "#3B82F6",
    title: "Institutional Charting",
    desc: "180-day interactive candlestick charts with live OHLCV data. Powered by the same engine used by hedge funds.",
    metric: "60fps rendering"
  },
  {
    id: "03",
    icon: Zap,
    accent: "#8B5CF6",
    title: "AI-Driven Signal Synthesis",
    desc: "We compute RSI, MACD, and MA crosses server-side to generate a clear, actionable signal score.",
    metric: "Multi-factor model"
  },
  {
    id: "04",
    icon: Wallet,
    accent: "#F59E0B",
    title: "True Net Profit Tracking",
    desc: "Stop guessing. We calculate exact STCG/LTCG tax, STT, and brokerage to show your real bottom line.",
    metric: "SEBI-compliant"
  }
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const reduce = useReducedMotion();

  return (
    <section 
      id="how-it-works" 
      ref={containerRef}
      className="relative py-32 bg-[#0B0F14] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-transparent via-[#1A2233]/20 to-transparent blur-[100px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              <span className="text-xs font-medium tracking-wide text-[#E6EDF3] uppercase">Workflow</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 leading-[1.1]">
              From search to insight in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]">under 10 seconds.</span>
            </h2>
            <p className="text-lg text-[#9CA3AF] font-light leading-relaxed">
              We eliminated the noise. Four engineered steps designed for absolute clarity and maximum execution speed.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Central Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />
          
          <motion.div 
            className="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-[#00FFA3] to-[#3B82F6] -translate-x-1/2 origin-top"
            style={{ scaleY: scrollYProgress }}
          />

          <div className="space-y-12 lg:space-y-32">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0">
                  {/* Timeline dot for desktop */}
                  <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0B0F14] border border-white/10 items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: step.accent, boxShadow: `0 0 20px ${step.accent}80` }} />
                  </div>

                  {/* Left Content */}
                  <motion.div 
                    className={`w-full lg:w-[45%] ${isEven ? "lg:text-right lg:pr-16" : "lg:order-2 lg:text-left lg:pl-16"}`}
                    initial={reduce ? false : { opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={`inline-flex items-center gap-3 mb-4 ${isEven ? "lg:flex-row-reverse" : ""}`}>
                      <span className="text-4xl font-black text-white/5">{step.id}</span>
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-[#9CA3AF] leading-relaxed mb-6">
                      {step.desc}
                    </p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm font-medium ${isEven ? "lg:mr-auto lg:ml-0" : ""}`} style={{ color: step.accent }}>
                      <Zap size={14} /> {step.metric}
                    </div>
                  </motion.div>

                  {/* Right Content / Visual */}
                  <motion.div 
                    className={`w-full lg:w-[45%] ${isEven ? "lg:order-2 lg:pl-16" : "lg:pr-16"}`}
                    initial={reduce ? false : { opacity: 0, scale: 0.9, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="relative aspect-video rounded-2xl bg-[#121826]/80 backdrop-blur-xl border border-white/10 overflow-hidden group shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${step.accent}20 0%, transparent 70%)` }} />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-black/40 border border-white/10 shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                          <Icon size={32} style={{ color: step.accent }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
