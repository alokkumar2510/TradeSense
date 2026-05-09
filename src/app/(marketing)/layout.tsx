import type { Metadata } from 'next';
import styles from './landing.module.css';

export const metadata: Metadata = {
  title: 'TradeSense Pro — Institutional-Grade Trading Intelligence',
  description:
    'A cinematic quant research workstation. Real-time analytics, strategy simulation, and an advanced trading terminal modeled after Bloomberg & TradingView Pro.',
  keywords: [
    'institutional trading', 'quant research', 'stock analysis', 'TradeSense Pro',
    'Bloomberg terminal', 'TradingView', 'NSE', 'BSE', 'India', 'trading workstation',
  ],
  authors: [{ name: 'TradeSense Pro', url: 'https://tradesense.alokkumarsahu.in' }],
  openGraph: {
    title: 'TradeSense Pro',
    description: 'Institutional-grade trading intelligence platform.',
    type: 'website',
    url: 'https://tradesense.alokkumarsahu.in',
    siteName: 'TradeSense Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradeSense Pro — Institutional-Grade Trading Intelligence',
    description: 'A cinematic quant research workstation. Real-time analytics & strategy simulation.',
  },
  robots: { index: true, follow: true },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.marketingRoot}>{children}</div>;
}
