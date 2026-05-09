'use client';
import { motion } from 'framer-motion';

const STACK = [
  { name: 'Next.js 15', role: 'App Router · Static Export · RSC', tier: 'Frontend' },
  { name: 'Cloudflare Pages', role: 'Global CDN · Edge Runtime · KV Store', tier: 'Infra' },
  { name: 'Cloudflare Workers', role: 'API Proxy · Rate limiting · Secret vault', tier: 'Infra' },
  { name: 'FMP API', role: 'Real-time quotes · Financials · Earnings', tier: 'Data' },
  { name: 'Alpha Vantage', role: 'Historical OHLCV · Technical indicators', tier: 'Data' },
  { name: 'Firebase Auth', role: 'Google SSO · Session management', tier: 'Auth' },
  { name: 'Framer Motion', role: 'GPU-accelerated animations · Gestures', tier: 'UI' },
  { name: 'Zustand', role: 'Global market state · Persistence layer', tier: 'State' },
];

const TIER_COLORS: Record<string, string> = {
  Frontend: '#3D8EFF',
  Infra: '#FB923C',
  Data: '#00FFB2',
  Auth: '#C084FC',
  UI: '#F472B6',
  State: '#34D399',
};

const METRICS = [
  { k: 'Uptime SLA', v: '99.9%' },
  { k: 'Cache TTL', v: '30s' },
  { k: 'Edge PoPs', v: '300+' },
  { k: 'API Latency', v: '<80ms' },
];

export default function Infrastructure() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '80px 6vw 140px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: 720, marginBottom: 60 }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FB923C', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FB923C', boxShadow: '0 0 12px #FB923C', display: 'block' }} />
          06 — Infrastructure
        </div>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '24px 0 20px' }}>
          Built on the edge.
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-mid)', maxWidth: 580, lineHeight: 1.6 }}>
          Every layer chosen for latency and reliability. No cold starts.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 900, margin: '0 auto 60px' }}>
        {METRICS.map((m, i) => (
          <motion.div key={m.k} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ padding: '24px 20px', borderRadius: 14, background: 'rgba(10,17,34,0.5)', border: '1px solid var(--line-strong)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: '#E6EDF3' }}>{m.v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-low)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>{m.k}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, maxWidth: 1200, margin: '0 auto' }}>
        {STACK.map((s, i) => {
          const col = TIER_COLORS[s.tier] ?? '#8B949E';
          return (
            <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.08 }} whileHover={{ borderColor: col + '55' }} style={{ padding: '18px 20px', borderRadius: 14, background: 'linear-gradient(180deg, rgba(10,17,34,0.5), rgba(6,11,23,0.3))', border: '1px solid var(--line-strong)', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'border-color 300ms' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, boxShadow: `0 0 10px ${col}`, marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-low)', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>{s.role}</div>
                <div style={{ marginTop: 8, display: 'inline-block', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: col + '18', color: col, fontFamily: 'var(--font-mono)' }}>{s.tier}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
