'use client';
import { motion } from 'framer-motion';

const TICKERS = [
  { s: 'NIFTY 50', p: '24,847.20', c: '+0.84%', up: true },
  { s: 'SENSEX', p: '81,332.04', c: '+0.62%', up: true },
  { s: 'BANKNIFTY', p: '54,201.55', c: '-0.21%', up: false },
  { s: 'INDIA VIX', p: '13.42', c: '-2.10%', up: false },
  { s: 'RELIANCE', p: '2,941.10', c: '+1.42%', up: true },
  { s: 'TCS', p: '4,128.85', c: '+0.34%', up: true },
  { s: 'HDFCBANK', p: '1,712.30', c: '-0.18%', up: false },
  { s: 'INFY', p: '1,887.45', c: '+1.08%', up: true },
  { s: 'ICICIBANK', p: '1,289.65', c: '+0.71%', up: true },
  { s: 'BAJFIN', p: '7,412.30', c: '+0.92%', up: true },
  { s: 'WIPRO', p: '487.55', c: '-0.35%', up: false },
  { s: 'LT', p: '3,621.80', c: '+1.15%', up: true },
];

export default function TickerStream() {
  const all = [...TICKERS, ...TICKERS];
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 2,
        padding: '40px 0',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        background: 'rgba(6,11,23,0.6)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{
          display: 'flex',
          gap: 48,
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {all.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'baseline',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: 'var(--text-low)', fontSize: 11, letterSpacing: '0.1em' }}>
              {t.s}
            </span>
            <span style={{ color: 'var(--text-hi)', fontSize: 14 }}>{t.p}</span>
            <span style={{ color: t.up ? 'var(--neon)' : 'var(--red)', fontSize: 12 }}>
              {t.up ? '▲' : '▼'} {t.c}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
