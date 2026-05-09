'use client';
import Link from 'next/link';

const NAV_LINKS = ['Features', 'Strategy Lab', 'Infrastructure', 'Pricing'];
const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Twitter/X', href: 'https://x.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
];

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid var(--line)',
        padding: '60px 6vw 40px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: 40,
          alignItems: 'start',
          marginBottom: 48,
          flexWrap: 'wrap',
        }}
      >
        {/* brand */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, var(--neon), var(--blue))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 12,
            }}
          >
            TradeSense
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-low)', maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
            Institutional-grade market intelligence for the independent trader.
            Built with precision, deployed on the edge.
          </p>
        </div>

        {/* nav */}
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: 'var(--text-low)', marginBottom: 16, textTransform: 'uppercase' }}>Product</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NAV_LINKS.map((l) => (
              <Link key={l} href="#" style={{ fontSize: 13, color: 'var(--text-mid)', textDecoration: 'none', transition: 'color 200ms' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E6EDF3')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mid)')}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>

        {/* social */}
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.14em', color: 'var(--text-low)', marginBottom: 16, textTransform: 'uppercase' }}>Connect</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--text-mid)', textDecoration: 'none', transition: 'color 200ms' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E6EDF3')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mid)')}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 24,
          borderTop: '1px solid var(--line)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>
          © {new Date().getFullYear()} TradeSense · All rights reserved
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>
          Not financial advice · For informational use only
        </span>
      </div>
    </footer>
  );
}
