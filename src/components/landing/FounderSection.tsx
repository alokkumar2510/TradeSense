'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/alokkumar2510',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/alok-kumar-sahu-2510',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/alokkumar2510',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Portfolio',
    href: 'https://alokkumarsahu.in',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export default function FounderSection() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '80px 6vw 120px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '56px 64px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(10,17,34,0.7), rgba(6,11,23,0.5))',
          border: '1px solid var(--line-strong)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* accent glow */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,178,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,142,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, position: 'relative' }}>

          {/* avatar + identity row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* photo */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid rgba(0,255,178,0.35)',
                boxShadow: '0 0 28px rgba(0,255,178,0.15)',
              }}
            >
              <Image
                src="/founder.png"
                alt="Alok Kumar Sahu — Founder of TradeSense"
                width={88}
                height={88}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                priority
              />
            </motion.div>

            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                Alok Kumar Sahu
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-low)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                Founder · Full-Stack Engineer · Quant Trader
              </div>

              {/* social handles */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--line-strong)',
                      color: 'var(--text-mid)',
                      textDecoration: 'none',
                      transition: 'all 200ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0,255,178,0.4)';
                      e.currentTarget.style.color = '#E6EDF3';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--line-strong)';
                      e.currentTarget.style.color = 'var(--text-mid)';
                    }}
                  >
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* quote */}
          <blockquote style={{ margin: 0, borderLeft: '3px solid var(--neon)', paddingLeft: 24 }}>
            <p style={{ fontSize: 'clamp(16px, 2vw, 21px)', lineHeight: 1.6, color: '#C9D1D9', fontStyle: 'italic', margin: 0 }}>
              "I built TradeSense because I needed a platform that thinks in
              signals, not noise. Every widget, every engine, every animation
              exists to collapse the gap between analysis and action — giving
              independent traders the same leverage that institutional desks
              take for granted."
            </p>
          </blockquote>

          {/* chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['NSE · BSE Focus', '5+ yrs trading', 'Full-stack engineer', 'Berhampur, Odisha', 'Open source advocate'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  padding: '5px 14px',
                  borderRadius: 20,
                  background: 'rgba(61,142,255,0.1)',
                  border: '1px solid rgba(61,142,255,0.25)',
                  color: 'var(--blue)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

        </div>
      </motion.div>
    </section>
  );
}
