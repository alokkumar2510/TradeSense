'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: 'min(1200px, calc(100vw - 32px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderRadius: 16,
        background: scrolled ? 'rgba(6,11,23,0.72)' : 'rgba(6,11,23,0.35)',
        border: '1px solid var(--line)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        transition: 'background 300ms ease',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--neon), var(--blue))',
            boxShadow: '0 0 20px rgba(0,255,178,0.4)',
            display: 'grid',
            placeItems: 'center',
            color: '#02050C',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
          }}
        >
          T
        </div>
        <span style={{ color: 'var(--text-hi)', fontWeight: 600, letterSpacing: '-0.01em' }}>
          TradeSense <span style={{ color: 'var(--neon)' }}>Pro</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div
        style={{ display: 'flex', gap: 28, alignItems: 'center' }}
        className="nav-links"
      >
        {['Intelligence', 'Strategy Lab', 'Infrastructure', 'Founder'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(' ', '-')}`}
            style={{
              color: 'var(--text-mid)',
              fontSize: 13,
              textDecoration: 'none',
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-hi)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-mid)')}
          >
            {item}
          </a>
        ))}
      </div>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Link
          href="/login"
          style={{
            fontSize: 13,
            color: 'var(--text-hi)',
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid var(--line-strong)',
          }}
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          style={{
            fontSize: 13,
            color: '#02050C',
            textDecoration: 'none',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'linear-gradient(180deg, var(--neon), #00D89A)',
            boxShadow: '0 8px 24px rgba(0,255,178,0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          Launch Terminal →
        </Link>
      </div>
    </motion.nav>
  );
}
