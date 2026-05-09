'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface LivePanelProps {
  title: string;
  value: number;
  sub: string;
  color: string;
  delay: number;
}

function LivePanel({ title, value, sub, color, delay }: LivePanelProps) {
  const [val, setVal] = useState(value);

  useEffect(() => {
    const id = setInterval(() => {
      setVal((v) => +(v + (Math.random() - 0.5) * 0.4).toFixed(2));
    }, 1400 + Math.random() * 600);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      style={{
        position: 'relative',
        padding: 24,
        borderRadius: 16,
        background: 'linear-gradient(180deg, rgba(10,17,34,0.8), rgba(6,11,23,0.6))',
        border: '1px solid var(--line-strong)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-low)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 12px ${color}`,
            display: 'block',
          }}
        />
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 32,
          color: 'var(--text-hi)',
          marginTop: 14,
          letterSpacing: '-0.02em',
        }}
      >
        {val}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 4 }}>{sub}</div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 18,
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ width: ['20%', '85%', '60%', '95%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ height: '100%', background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </motion.div>
  );
}

export default function IntelligenceSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <section
      ref={ref}
      id="intelligence"
      style={{ position: 'relative', zIndex: 1, padding: '160px 6vw' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 32,
          alignItems: 'start',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {/* Copy Column */}
        <motion.div style={{ x, gridColumn: 'span 5' }}>
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
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--neon)',
                boxShadow: '0 0 12px var(--neon)',
                display: 'block',
              }}
            />
            01 — Intelligence Suite
          </div>

          <h2
            style={{
              fontSize: 'clamp(36px, 5vw, 72px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              margin: '24px 0 20px',
            }}
          >
            Six engines.<br />One verdict.
          </h2>

          <p style={{ fontSize: 18, color: 'var(--text-mid)', maxWidth: 620, lineHeight: 1.6 }}>
            Consensus, Emotion, Risk, Momentum, Institutional Activity, and Profit —
            deterministic engines that synthesize raw market data into actionable
            decisions, not noise.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, marginTop: 32 }}>
            {[
              ['CONSENSUS', 'Aggregated buy/sell/hold confidence'],
              ['EMOTION', 'Fear & Greed sentiment quantification'],
              ['RISK', 'Volatility-adjusted exposure scoring'],
              ['MOMENTUM', 'Velocity & strength of price action'],
              ['INSTITUTIONAL', 'Smart money flow & block trades'],
              ['PROFIT', 'STCG/LTCG with broker-aware netting'],
            ].map(([k, v], i) => (
              <motion.li
                key={k}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 24,
                  padding: '14px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--neon)',
                    letterSpacing: '0.14em',
                  }}
                >
                  {k}
                </span>
                <span style={{ color: 'var(--text-mid)', fontSize: 14 }}>{v}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Live Panels Grid */}
        <div
          style={{
            gridColumn: 'span 7',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <LivePanel title="Consensus" value={78.4} sub="Strong Buy · 12 signals aligned" color="#00FFB2" delay={0} />
          <LivePanel title="Emotion Index" value={62.1} sub="Greed territory · cooling" color="#FFB547" delay={0.1} />
          <LivePanel title="Risk Score" value={3.2} sub="Low volatility regime" color="#3D8EFF" delay={0.2} />
          <LivePanel title="Momentum" value={84.7} sub="Accelerating · 5d trailing" color="#00FFB2" delay={0.3} />
          <div style={{ gridColumn: 'span 2' }}>
            <LivePanel
              title="Institutional Flow"
              value={1247.8}
              sub="₹ Cr net inflow · last 24h · FII + DII"
              color="#3D8EFF"
              delay={0.4}
            />
          </div>
        </div>
      </div>

      {/* Responsive override via inline style tag — no styled-jsx, use a data attr */}
      <style>{`
        @media (max-width: 980px) {
          [data-intel-copy] { grid-column: span 12 !important; }
          [data-intel-grid] { grid-column: span 12 !important; grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
