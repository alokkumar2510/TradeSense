'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '80px 6vw 140px', textAlign: 'center' }}>
      {/* radial glow backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,255,178,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--neon)', marginBottom: 28 }}>
          Ready to trade like the pros?
        </div>

        <h2 style={{ fontSize: 'clamp(42px, 6vw, 88px)', fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 0.98, margin: '0 0 32px' }}>
          <span style={{ background: 'linear-gradient(135deg, #E6EDF3 0%, rgba(230,237,243,0.5) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your edge is one<br />login away.
          </span>
        </h2>

        <p style={{ fontSize: 18, color: 'var(--text-mid)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 48px' }}>
          Join traders who run institutional-grade analytics without a Bloomberg
          terminal price tag. Free during beta.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/auth/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 38px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 600,
                background: 'var(--neon)',
                color: '#02050C',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                boxShadow: '0 0 40px rgba(0,255,178,0.3)',
              }}
            >
              Start Free — No CC Required
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 38px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 500,
                background: 'transparent',
                color: '#E6EDF3',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                border: '1px solid var(--line-strong)',
              }}
            >
              View Dashboard Demo
            </Link>
          </motion.div>
        </div>

        <p style={{ marginTop: 28, fontSize: 12, color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>
          No credit card · No hidden fees · Beta access open
        </p>
      </motion.div>
    </section>
  );
}
