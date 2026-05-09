'use client';
import { motion } from 'framer-motion';

export default function StrategyLab() {
  return (
    <section id="strategy-lab" style={{ position: 'relative', zIndex: 1, padding: '80px 6vw 160px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: 720, marginBottom: 60 }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--neon)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon)', boxShadow: '0 0 12px var(--neon)', display: 'block' }} />
            02 — Strategy Lab
          </div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '24px 0 20px' }}>
            Backtest at the speed of thought.
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-mid)', maxWidth: 620, lineHeight: 1.6 }}>
            Compose, simulate, and stress-test strategies against decades of market data.
            The Strategy Lab doesn&apos;t approximate — it replays every tick.
          </p>
        </motion.div>

        {/* Mock Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid var(--line-strong)',
            background: 'linear-gradient(180deg, rgba(10,17,34,0.9), rgba(2,5,12,0.95))',
            boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(61,142,255,0.1)',
          }}
        >
          {/* Top bar */}
          <div
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 8,
              background: 'rgba(0,0,0,0.4)',
              borderBottom: '1px solid var(--line-strong)',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {['#FF5470', '#FFB547', '#00FFB2'].map((c) => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-low)', marginLeft: 12 }}>
              tradesense.pro / strategy-lab — momentum-burst.ts
            </div>
          </div>

          {/* Terminal Interior */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr 280px',
              minHeight: 560,
            }}
          >
            {/* Sidebar */}
            <div style={{ padding: 20, borderRight: '1px solid var(--line)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-low)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
                Strategies
              </div>
              {['Mean Reversion', 'Momentum Burst', 'Volume Spike', 'RSI Divergence', 'MACD Cross'].map((s, i) => (
                <div
                  key={s}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 4,
                    fontFamily: 'var(--font-mono)',
                    color: i === 1 ? 'var(--neon)' : 'var(--text-mid)',
                    background: i === 1 ? 'rgba(0,255,178,0.08)' : 'transparent',
                    border: i === 1 ? '1px solid rgba(0,255,178,0.2)' : '1px solid transparent',
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div style={{ padding: 24, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-hi)' }}>
                    MOMENTUM BURST · NIFTY50 · 5Y
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-low)', marginTop: 4 }}>
                    Backtest complete · 1,287 trades
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--text-low)' }}>CAGR </span>
                    <span style={{ color: 'var(--neon)' }}>+27.4%</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-low)' }}>SHARPE </span>
                    <span style={{ color: 'var(--text-hi)' }}>1.84</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-low)' }}>DD </span>
                    <span style={{ color: 'var(--red)' }}>-12.1%</span>
                  </div>
                </div>
              </div>

              {/* Equity Curve SVG */}
              <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#00FFB2" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#00FFB2" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="bmGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#3D8EFF" stopOpacity="0.15" />
                    <stop offset="1" stopColor="#3D8EFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.2, 0.4, 0.6, 0.8].map((yPct) => (
                  <line
                    key={yPct}
                    x1="0"
                    x2="600"
                    y1={yPct * 280}
                    y2={yPct * 280}
                    stroke="rgba(255,255,255,0.04)"
                  />
                ))}
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  d="M0,220 C60,210 100,200 150,180 C200,160 240,170 290,140 C340,110 380,120 430,80 C480,50 530,40 600,20"
                  fill="none"
                  stroke="#00FFB2"
                  strokeWidth="2"
                />
                <path
                  d="M0,220 C60,210 100,200 150,180 C200,160 240,170 290,140 C340,110 380,120 430,80 C480,50 530,40 600,20 L600,280 L0,280 Z"
                  fill="url(#eqGrad)"
                  opacity="0.6"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: 'easeInOut', delay: 0.3 }}
                  d="M0,230 C80,225 140,215 200,205 C260,195 320,200 380,180 C440,160 500,150 600,130"
                  fill="none"
                  stroke="#3D8EFF"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
              </svg>
            </div>

            {/* Right Rail — Trade Log */}
            <div style={{ padding: 20, borderLeft: '1px solid var(--line)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-low)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>
                Trade Log
              </div>
              {[
                ['09:47', 'BUY', 'RELIANCE', '+2.1%'],
                ['10:12', 'SELL', 'TCS', '+0.8%'],
                ['11:03', 'BUY', 'HDFC', '-0.4%'],
                ['11:48', 'BUY', 'INFY', '+1.4%'],
                ['12:21', 'SELL', 'ICICI', '+3.2%'],
                ['13:05', 'BUY', 'BAJFIN', '+0.9%'],
                ['14:11', 'SELL', 'WIPRO', '-1.1%'],
              ].map(([t, side, sym, pnl], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 50px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <span style={{ color: 'var(--text-low)' }}>{t}</span>
                  <span style={{ color: side === 'BUY' ? 'var(--neon)' : 'var(--red)' }}>
                    {side} {sym}
                  </span>
                  <span
                    style={{
                      color: pnl.startsWith('+') ? 'var(--neon)' : 'var(--red)',
                      textAlign: 'right',
                    }}
                  >
                    {pnl}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          [data-lab-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
