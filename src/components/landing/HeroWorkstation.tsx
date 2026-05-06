"use client";

import { motion } from "framer-motion";

/* ── Realistic floating trading workstation for the hero ── */
export default function HeroWorkstation() {
  return (
    <div className="relative" style={{ minHeight: 480 }}>
      {/* Ambient glow behind workstation */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 400, top: "10%", left: "5%",
          background: "radial-gradient(ellipse, rgba(0,255,163,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Main chart panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateY: -3 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="l-glass relative"
        style={{
          padding: 0, overflow: "hidden",
          boxShadow: "0 20px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,255,163,0.04)",
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            height: 36, padding: "0 14px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(6,10,16,0.9)",
            display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", opacity: 0.7 }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", opacity: 0.7 }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", opacity: 0.7 }} />
          </div>
          <span className="l-mono" style={{ fontSize: 10, color: "#4B5563" }}>tradesense.pro/terminal — RELIANCE</span>
        </div>

        {/* Ticker strip */}
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>RELIANCE</span>
            <span
              className="l-mono"
              style={{
                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                background: "rgba(59,130,246,0.1)", color: "#3B82F6",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              NSE
            </span>
            <span className="l-mono" style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>₹2,847.60</span>
            <span className="l-mono" style={{ fontSize: 12, color: "#00FFA3", fontWeight: 600 }}>+1.37%</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["1D", "1W", "1M", "6M"].map(t => (
              <span
                key={t}
                className="l-mono"
                style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                  ...(t === "6M"
                    ? { background: "rgba(255,255,255,0.1)", color: "#fff" }
                    : { color: "#6B7280" }),
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Chart area */}
        <div style={{ position: "relative", height: 240, background: "#080C14", overflow: "hidden" }}>
          {/* Grid lines */}
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Candlesticks */}
          <svg viewBox="0 0 500 200" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path d="M0,170 L50,145 L100,155 L150,110 L200,125 L250,70 L300,85 L350,45 L400,55 L450,25 L500,40 L500,200 L0,200Z" fill="url(#hg1)" />
            {/* Main line */}
            <path d="M0,170 L50,145 L100,155 L150,110 L200,125 L250,70 L300,85 L350,45 L400,55 L450,25 L500,40" fill="none" stroke="#00FFA3" strokeWidth="2" />
            {/* MA overlay */}
            <path d="M0,160 Q125,135 250,95 T500,50" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
            {/* Candlestick bars */}
            {[
              { x: 40, o: 150, c: 142, h: 135, l: 155, bull: true },
              { x: 80, o: 155, c: 148, h: 140, l: 160, bull: true },
              { x: 120, o: 148, c: 155, h: 145, l: 162, bull: false },
              { x: 160, o: 120, c: 108, h: 100, l: 125, bull: true },
              { x: 200, o: 125, c: 118, h: 110, l: 130, bull: true },
              { x: 240, o: 85, c: 72, h: 65, l: 90, bull: true },
              { x: 280, o: 88, c: 80, h: 72, l: 92, bull: true },
              { x: 320, o: 55, c: 42, h: 35, l: 60, bull: true },
              { x: 360, o: 50, c: 55, h: 42, l: 62, bull: false },
              { x: 400, o: 55, c: 48, h: 38, l: 58, bull: true },
              { x: 440, o: 30, c: 22, h: 18, l: 35, bull: true },
            ].map((c, i) => (
              <g key={i}>
                <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={c.bull ? "#00FFA3" : "#EF4444"} strokeWidth="1" />
                <rect
                  x={c.x - 4} y={Math.min(c.o, c.c)} width={8} height={Math.abs(c.c - c.o) || 2}
                  fill={c.bull ? "#00FFA3" : "#EF4444"} rx="1"
                />
              </g>
            ))}
            {/* Crosshair */}
            <line x1="350" y1="0" x2="350" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="45" x2="500" y2="45" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="350" cy="45" r="4" fill="#00FFA3" opacity="0.8" />
          </svg>
          {/* Price labels */}
          <div className="l-mono" style={{ position: "absolute", right: 8, top: 8, fontSize: 9, color: "#4B5563", display: "flex", flexDirection: "column", gap: 28 }}>
            <span>3,000</span><span>2,900</span><span>2,800</span><span>2,700</span>
          </div>
        </div>

        {/* OHLCV strip */}
        <div
          className="l-mono"
          style={{
            padding: "8px 16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex", flexWrap: "wrap", gap: 16,
            fontSize: 11, color: "#6B7280",
          }}
        >
          <span>O <span style={{ color: "#9CA3AF" }}>2,821.30</span></span>
          <span>H <span style={{ color: "#00FFA3" }}>2,854.90</span></span>
          <span>L <span style={{ color: "#EF4444" }}>2,815.60</span></span>
          <span>C <span style={{ color: "#9CA3AF" }}>2,847.60</span></span>
          <span>Vol <span style={{ color: "#9CA3AF" }}>12.4M</span></span>
        </div>
      </motion.div>

      {/* ── Floating AI signal card (overlapping top-right) ── */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="l-glass"
        style={{
          position: "absolute", top: -16, right: -12,
          padding: "14px 18px", zIndex: 10, minWidth: 180,
          boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,163,0.06)",
        }}
      >
        <div style={{ fontSize: 9, color: "#6B7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>AI Signal</div>
        <div className="l-mono" style={{ fontSize: 20, fontWeight: 900, color: "#00FFA3", letterSpacing: "-0.02em", textShadow: "0 0 20px rgba(0,255,163,0.3)" }}>
          STRONG BUY
        </div>
        <div className="l-mono" style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>Confidence: 86%</div>
        <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ width: "86%", height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #00FFA3, #3B82F6)" }} />
        </div>
      </motion.div>

      {/* ── Floating portfolio card (overlapping bottom-left) ── */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="l-glass"
        style={{
          position: "absolute", bottom: -20, left: -16,
          padding: "14px 18px", zIndex: 10, minWidth: 190,
          boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 9, color: "#6B7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Net P&L Today</div>
        <div className="l-mono" style={{ fontSize: 22, fontWeight: 900, color: "#00FFA3" }}>+₹7,540</div>
        <div style={{ fontSize: 10, color: "#4B5563", marginTop: 2 }}>After STT & brokerage</div>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
          {[
            { t: "TCS", v: "+₹3.2k", c: "#00FFA3" },
            { t: "INFY", v: "-₹1.1k", c: "#EF4444" },
            { t: "HDFC", v: "+₹5.4k", c: "#00FFA3" },
          ].map(p => (
            <div key={p.t} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9CA3AF" }}>{p.t}</span>
              <span className="l-mono" style={{ color: p.c, fontWeight: 600 }}>{p.v}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Floating latency badge (mid-left) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="l-glass"
        style={{
          position: "absolute", top: "45%", left: -24,
          padding: "8px 14px", zIndex: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="l-mono" style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>13ms</div>
        <div style={{ fontSize: 9, color: "#6B7280" }}>Latency</div>
      </motion.div>
    </div>
  );
}
