'use client';
import { motion } from 'framer-motion';

const STEPS = [
  {
    id: '01',
    label: 'Market Data',
    sub: 'FMP · Alpha Vantage · NSE real-time feeds',
    color: '#3D8EFF',
  },
  {
    id: '02',
    label: 'Edge Cache',
    sub: 'Cloudflare KV · sub-100ms reads · rate-limit shield',
    color: '#00FFB2',
  },
  {
    id: '03',
    label: 'Signal Engine',
    sub: 'RSI · MACD · EMA · consensus scoring',
    color: '#C084FC',
  },
  {
    id: '04',
    label: 'Risk Layer',
    sub: 'VaR · drawdown · position sizing guards',
    color: '#FB923C',
  },
  {
    id: '05',
    label: 'Workstation UI',
    sub: 'Bloomberg-grade terminal · zero-latency widgets',
    color: '#00FFB2',
  },
];

export default function InstitutionalFlow() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '80px 6vw 140px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: 720, marginBottom: 80 }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--blue)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', boxShadow: '0 0 12px var(--blue)', display: 'block' }} />
          04 — Institutional Flow
        </div>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '24px 0 20px' }}>
          From data to decision<br />in milliseconds.
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-mid)', maxWidth: 580, lineHeight: 1.6 }}>
          A deterministic pipeline — no guesswork, no delays. Every layer is
          observable, cacheable, and auditable.
        </p>
      </motion.div>

      {/* Pipeline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          maxWidth: 860,
          margin: '0 auto',
        }}
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.12, duration: 0.7 }}
            style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}
          >
            {/* spine */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: `2px solid ${step.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: step.color,
                  background: 'rgba(2,5,12,0.9)',
                  flexShrink: 0,
                  boxShadow: `0 0 16px ${step.color}33`,
                  zIndex: 1,
                }}
              >
                {step.id}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 40,
                    background: `linear-gradient(to bottom, ${step.color}66, ${STEPS[i + 1].color}44)`,
                  }}
                />
              )}
            </div>

            {/* card */}
            <motion.div
              whileHover={{ x: 6, borderColor: step.color + '55' }}
              transition={{ duration: 0.25 }}
              style={{
                flex: 1,
                margin: '0 0 12px 20px',
                padding: '20px 24px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(10,17,34,0.6), rgba(6,11,23,0.3))',
                border: '1px solid var(--line-strong)',
                transition: 'border-color 300ms',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
                {step.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>
                {step.sub}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
