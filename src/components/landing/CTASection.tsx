"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code } from "lucide-react";

export default function CTASection() {
  const reduce = useReducedMotion();

  return (
    <section className="py-40 lg:py-64 relative bg-[#0B0F14] overflow-hidden flex flex-col items-center justify-center text-center">
      
      {/* Intense Ambient Backlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 bg-[#00FFA3]/10 blur-[200px] rounded-[100%]" />
        <div className="absolute inset-0 bg-[#3B82F6]/10 blur-[200px] rounded-[100%] translate-y-20" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 80%)'
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 flex flex-col items-center">
        
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-12 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFA3] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFA3]"></span>
          </span>
          <span className="text-sm font-bold uppercase tracking-widest text-[#E6EDF3]">Deploy Your Edge</span>
        </motion.div>

        <motion.h2
          className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.9] tracking-[-0.04em] mb-12 drop-shadow-2xl"
          initial={reduce ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Trade with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#6B7280]">
            Certainty.
          </span>
        </motion.h2>

        <motion.p
          className="text-xl md:text-3xl text-[#9CA3AF] max-w-3xl mb-16 leading-relaxed font-light"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Stop guessing. Start using institutional-grade charts, multi-indicator AI signals, and precise portfolio mathematics today.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/login"
            className="group relative flex items-center justify-center gap-3 px-12 py-6 rounded-2xl font-black text-lg text-[#0B0F14] bg-white overflow-hidden w-full sm:w-auto transition-transform hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative z-10 flex items-center gap-2">
              Launch Platform
              <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </span>
          </Link>
          
          <a
            href="https://github.com/alokkumarsahu/tradesense"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-12 py-6 rounded-2xl font-bold text-lg text-white bg-[#121826]/80 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all w-full sm:w-auto backdrop-blur-md"
          >
            <Code size={20} />
            View on GitHub
          </a>
        </motion.div>

      </div>
    </section>
  );
}
