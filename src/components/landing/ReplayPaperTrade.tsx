'use client';
import { motion } from 'framer-motion';

const REPLAY_TICKS = [
  { t: '09:15', p: '₹2,481.20', c: '+0.00%', col: '#8B949E' },
  { t: '09:22', p: '₹2,496.80', c: '+0.63%', col: '#00FFB2' },
  { t: '09:37', p: '₹2,512.40', c: '+1.26%', col: '#00FFB2' },
  { t: '10:05', p: '₹2,489.60', c: '+0.34%', col: '#00FFB2' },
  { t: '10:41', p: '₹2,464.20', c: '-0.69%', col: '#FF4D4D' },
  { t: '11:18', p: '₹2,478.00', c: '-0.12%', col: '#FF4D4D' },
];

const PAPER_POSITIONS = [
  { sym: 'RELIANCE', qty: 10, pnl: '+₹1,840', dir: true },
  { sym: 'INFY', qty: 25, pnl: '+₹ 640', dir: true },
  { sym: 'HDFC', qty: 5, pnl: '-₹ 220', dir: false },
  { sym: 'TCS', qty: 15, pnl: '+₹ 980', dir: true },
];

export default function ReplayPaperTrade() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '80px 6vw 140px' }}>
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
          05 — Train & Test
        </div>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '24px 0 20px' }}>
          Sharpen your edge<br />before you risk it.
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-mid)', maxWidth: 580, lineHeight: 1.6 }}>
          Replay historical sessions tick-by-tick. Validate strategies in the
          paper account. Graduate to live when the numbers prove it.
        </p>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 20,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Replay Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            borderRadius: 18,
            background: 'linear-gradient(180deg, rgba(10,17,34,0.6), rgba(6,11,23,0.4))',
            border: '1px solid var(--line-strong)',
            overflow: 'hidden',
          }}
        >
          {/* terminal header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              borderBottom: '1px solid var(--line)',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
            <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-low)' }}>
              REPLAY — NIFTY50 · 2024-03-14 · 8× speed
            </span>
          </div>
          <div style={{ padding: '20px 18px' }}>
            {REPLAY_TICKS.map((tick, i) => (
              <motion.div
                key={tick.t}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 1fr',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--line)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text-low)' }}>{tick.t}</span>
                <span style={{ color: '#E6EDF3' }}>{tick.p}</span>
                <span style={{ color: tick.col, textAlign: 'right' }}>{tick.c}</span>
              </motion.div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              {['⏪ Prev', '▶ Play', '⏩ Next', '× 8'].map((btn) => (
                <button
                  key={btn}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(61,142,255,0.12)',
                    border: '1px solid rgba(61,142,255,0.3)',
                    color: 'var(--blue)',
                    cursor: 'pointer',
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Paper Trade Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          style={{
            borderRadius: 18,
            background: 'linear-gradient(180deg, rgba(10,17,34,0.6), rgba(6,11,23,0.4))',
            border: '1px solid var(--line-strong)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: '1px solid var(--line)',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-low)' }}>
              PAPER ACCOUNT — SIMULATED
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--neon)', background: 'rgba(0,255,178,0.1)', padding: '2px 8px', borderRadius: 4 }}>
              LIVE
            </span>
          </div>
          <div style={{ padding: '20px 18px' }}>
            {/* summary strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
                marginBottom: 24,
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(0,255,178,0.05)',
                border: '1px solid rgba(0,255,178,0.15)',
              }}
            >
              {[
                { k: 'Day P&L', v: '+₹3,240', c: '#00FFB2' },
                { k: 'Open Pos', v: '4', c: '#E6EDF3' },
                { k: 'Capital', v: '₹5,00,000', c: '#E6EDF3' },
              ].map((s) => (
                <div key={s.k}>
                  <div style={{ fontSize: 11, color: 'var(--text-low)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{s.k}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: s.c, fontFamily: 'var(--font-mono)' }}>{s.v}</div>
                </div>
              ))}
            </div>

            {PAPER_POSITIONS.map((pos, i) => (
              <motion.div
                key={pos.sym}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 80px',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#E6EDF3', fontWeight: 500 }}>{pos.sym}</span>
                <span style={{ color: 'var(--text-low)' }}>{pos.qty} qty</span>
                <span style={{ color: pos.dir ? '#00FFB2' : '#FF4D4D', textAlign: 'right' }}>{pos.pnl}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
