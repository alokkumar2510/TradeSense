'use client';
import { motion } from 'framer-motion';

const TOOLS = [
  {
    k: 'Command Palette',
    v: 'Cmd+K to navigate any symbol, route, or action — Bloomberg-grade speed.',
    code: '> AAPL\n> /strategy\n> /watchlist + ADD',
  },
  {
    k: 'Signal Engine',
    v: 'Server-side RSI + MACD crossovers, edge-cached for sub-100ms response.',
    code: 'SIGNAL: BUY\nRSI(14) 28.4\nMACD ↑ cross',
  },
  {
    k: 'Profit Engine',
    v: 'Tax-aware P&L: STCG, LTCG, broker fees, exchange charges, GST.',
    code: 'NET P&L\n  +₹14,820\n  -₹312 chg',
  },
  {
    k: 'Replay Mode',
    v: 'Time-travel through historical sessions tick-by-tick. Train your instinct.',
    code: '▶ 2024-03-14\n09:15 → 15:30\n× 8 speed',
  },
  {
    k: 'Paper Trading',
    v: 'Simulated execution against live data. Same UX, zero risk.',
    code: 'PAPER\n+₹2,141 today\n14 open pos',
  },
  {
    k: 'Edge Caching',
    v: 'Cloudflare KV layer. Rate-limit insulated. Built for scale.',
    code: 'CACHE HIT\nfmp.quote\nTTL 28s',
  },
];

export default function QuantTooling() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '80px 6vw 160px' }}>
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
          03 — Quant Tooling
        </div>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '24px 0 20px' }}>
          Tools, not toys.
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-mid)', maxWidth: 620, lineHeight: 1.6 }}>
          Every primitive is engineered for traders who measure their workflow in
          keystrokes. No mouse-heavy menus. No bloat.
        </p>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {TOOLS.map((t, i) => (
          <motion.div
            key={t.k}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: (i % 3) * 0.1, duration: 0.7 }}
            whileHover={{ y: -6, borderColor: 'rgba(0,255,178,0.3)' }}
            style={{
              padding: 28,
              borderRadius: 16,
              background: 'linear-gradient(180deg, rgba(10,17,34,0.5), rgba(6,11,23,0.3))',
              border: '1px solid var(--line-strong)',
              transition: 'border-color 300ms',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-low)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.14em',
              }}
            >
              0{i + 1}
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 500, margin: '12px 0 10px', letterSpacing: '-0.02em' }}>
              {t.k}
            </h3>
            <p style={{ color: 'var(--text-mid)', fontSize: 14, lineHeight: 1.55, margin: 0, flex: 1 }}>
              {t.v}
            </p>
            <pre
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: 10,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--neon)',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--line)',
                whiteSpace: 'pre',
                overflow: 'hidden',
              }}
            >
              {t.code}
            </pre>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
