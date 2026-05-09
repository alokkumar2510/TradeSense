'use client';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

// R3F scene loaded client-only (no SSR) for static export compatibility
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: 140,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 3D Scene Background */}
      <motion.div style={{ position: 'absolute', inset: 0, zIndex: 0, scale }}>
        <HeroScene />
      </motion.div>

      {/* Vignette */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(2,5,12,0.85) 75%)',
        }}
      />

      {/* Content */}
      <motion.div
        style={{
          y,
          opacity,
          position: 'relative',
          zIndex: 2,
          padding: '0 6vw',
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow"
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
          v4.7 · Quant Research Workstation
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(48px, 8vw, 128px)',
            lineHeight: 0.95,
            letterSpacing: '-0.045em',
            margin: '20px 0 12px',
            fontWeight: 500,
            maxWidth: '15ch',
          }}
        >
          The terminal <br />
          <span
            style={{
              background: 'linear-gradient(120deg, #EAF2FF 0%, #3D8EFF 45%, #00FFB2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            institutions deserve.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.9 }}
          style={{
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            color: 'var(--text-mid)',
            maxWidth: 560,
            lineHeight: 1.55,
            margin: '24px 0 40px',
          }}
        >
          A real-time intelligence suite engineered for serious traders. Deterministic
          analytical engines, modular widgets, and microsecond-aware UX — modeled after
          Bloomberg and TradingView Pro.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
        >
          <a
            href="/dashboard"
            style={{
              padding: '14px 26px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: '#02050C',
              textDecoration: 'none',
              background: 'linear-gradient(180deg, var(--neon), #00D89A)',
              boxShadow: '0 12px 40px rgba(0,255,178,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            Enter Terminal →
          </a>
          <a
            href="#intelligence"
            style={{
              padding: '14px 26px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text-hi)',
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--line-strong)',
              backdropFilter: 'blur(12px)',
            }}
          >
            Explore Intelligence
          </a>
        </motion.div>

        {/* Stat Strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9 }}
          style={{
            marginTop: 100,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
            paddingTop: 32,
            borderTop: '1px solid var(--line)',
            maxWidth: 900,
          }}
        >
          {[
            { v: '< 80ms', l: 'Quote Latency' },
            { v: '6+', l: 'Analytical Engines' },
            { v: '24/7', l: 'Cloudflare Edge' },
            { v: '∞', l: 'Strategy Backtests' },
          ].map((s) => (
            <div key={s.l}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 28,
                  color: 'var(--text-hi)',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-low)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: 6,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          fontSize: 10,
          color: 'var(--text-low)',
          letterSpacing: '0.2em',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
        }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          ↓ Scroll to enter
        </motion.div>
      </motion.div>
    </section>
  );
}
