"use client";

import { motion, useScroll, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Activity, Cpu } from "lucide-react";

export default function WhySection() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={containerRef} id="why-us" className="py-40 relative overflow-hidden bg-[#0B0F14]">
      {/* Deep Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00FFA3]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Massive Typographic Header */}
        <div className="max-w-4xl mb-32">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-[12vw] leading-none lg:text-[8rem] font-black text-white tracking-tighter mb-8 opacity-10">
              WHY US
            </h2>
            <div className="-mt-16 lg:-mt-24 pl-4 lg:pl-12 border-l-2 border-[#00FFA3]">
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
                Not just another app.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#3B82F6]">
                  An unfair advantage.
                </span>
              </h3>
              <p className="text-xl text-[#9CA3AF] max-w-2xl leading-relaxed font-light">
                Retail traders lose because they use disconnected, slow, and expensive tools. We engineered a unified environment that delivers the absolute clarity of an institutional terminal—without the bloat.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Large Left Block */}
          <motion.div 
            className="lg:col-span-7 bg-[#121826]/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-10 lg:p-14 relative overflow-hidden group"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <Activity className="text-[#00FFA3] w-12 h-12 mb-12" />
              <div>
                <h4 className="text-3xl font-bold text-white mb-4">Proprietary Signal Engine</h4>
                <p className="text-lg text-[#9CA3AF] leading-relaxed max-w-md">
                  We don&apos;t just dump indicators on a chart. Our backend synthesizes RSI, MACD, and multi-timeframe moving averages into a single, instantly actionable confidence score.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Stack */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
            
            {/* Top Right Block */}
            <motion.div 
              className="bg-[#121826]/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-10 relative overflow-hidden group flex-1"
              initial={reduce ? false : { opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/20 blur-[50px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <ShieldCheck className="text-[#3B82F6] w-10 h-10 mb-8" />
                <h4 className="text-2xl font-bold text-white mb-3">Zero Exposure Architecture</h4>
                <p className="text-[#9CA3AF] leading-relaxed">
                  Your API keys never touch our servers. We use edge proxies to route requests securely.
                </p>
              </div>
            </motion.div>

            {/* Bottom Right Block */}
            <motion.div 
              className="bg-[#121826]/40 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-10 relative overflow-hidden group flex-1"
              initial={reduce ? false : { opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative z-10">
                <Cpu className="text-[#F59E0B] w-10 h-10 mb-8" />
                <h4 className="text-2xl font-bold text-white mb-3">180-Day Institutional Data</h4>
                <p className="text-[#9CA3AF] leading-relaxed">
                  Deep historical OHLCV data processed and rendered at 60fps without breaking a sweat.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
