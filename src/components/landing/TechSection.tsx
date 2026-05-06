"use client";

import { motion, useReducedMotion } from "framer-motion";

const stack = [
  {
    name:   "Cloudflare Edge",
    role:   "Global API Gateway",
    accent: "#F97316",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden fill="none">
        <path d="M26.8 15.7c-.2-.7-.6-1.3-1.2-1.8a5.7 5.7 0 0 0-9.8 2.4 3.8 3.8 0 0 0-2.7 1.5 3.8 3.8 0 0 0 3 6.1h10.4a3.3 3.3 0 0 0 .3-6.2z" fill="currentColor" />
      </svg>
    ),
    desc: "Workers for serverless API proxy with zero cold starts. Cloudflare Pages for ultra-fast CDN delivery across 300+ edge locations.",
  },
  {
    name:   "Firebase Auth & DB",
    role:   "Identity & Persistence",
    accent: "#FBBF24",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden fill="none">
        <path d="M8 30L14.5 8l6.5 12L24 14l8 16H8z" fill="currentColor" />
      </svg>
    ),
    desc: "Secure Google OAuth for frictionless sign-in. Firestore powers real-time portfolio tracking and watchlist persistence.",
  },
  {
    name:   "TradingView Charts",
    role:   "Institutional Rendering",
    accent: "#3B82F6",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden fill="none">
        <polyline points="6,30 14,18 20,24 28,12 34,16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    desc: "The same high-performance HTML5 charting library used by thousands of professional trading desks and hedge funds worldwide.",
  },
  {
    name:   "Next.js Turbopack",
    role:   "React Framework",
    accent: "#E6EDF3",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden fill="currentColor">
        <path d="M20 4a16 16 0 1 0 13.86 24L20 10.4V30h-2V8h2l11.7 18.8A16 16 0 0 0 20 4z" />
      </svg>
    ),
    desc: "App Router and React Server Components ensure a production-grade, SEO-optimized, and zero-runtime-overhead architecture.",
  },
];

export default function TechSection() {
  const reduce = useReducedMotion();

  return (
    <section id="tech" className="py-32 lg:py-48 relative bg-[#0B0F14] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row gap-20">
        
        {/* Sticky Left Column */}
        <div className="lg:w-1/3">
          <div className="sticky top-32">
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
                <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
                <span className="text-xs font-bold text-[#E6EDF3] tracking-widest uppercase">Infrastructure</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
                Engineered for<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  zero latency.
                </span>
              </h2>
              <p className="text-lg md:text-xl text-[#9CA3AF] leading-relaxed font-light mb-12">
                Every piece of the stack was selected to process real-time market data instantly, securely, and reliably at scale.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Scrolling List */}
        <div className="lg:w-2/3 flex flex-col">
          {stack.map((tech, i) => (
            <motion.div
              key={tech.name}
              className="group relative border-t border-white/[0.05] py-12 lg:py-16 first:border-t-0 lg:first:border-t"
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Icon */}
                <div 
                  className="w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-105"
                  style={{ 
                    backgroundColor: `${tech.accent}10`, 
                    color: tech.accent, 
                    borderColor: `${tech.accent}30`,
                    boxShadow: `0 0 30px ${tech.accent}15`
                  }}
                >
                  {tech.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-4">
                    <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight group-hover:text-[var(--accent)] transition-colors duration-300" style={{ '--accent': tech.accent } as React.CSSProperties}>
                      {tech.name}
                    </h3>
                    <span className="text-sm font-bold tracking-widest uppercase" style={{ color: tech.accent }}>
                      {tech.role}
                    </span>
                  </div>
                  <p className="text-[#9CA3AF] text-lg leading-relaxed max-w-2xl">
                    {tech.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
