import type { Metadata, Viewport } from "next";
import "./landing.css";

import LandingNav      from "@/components/landing/LandingNav";
import NewLanding      from "@/components/landing/NewLanding";
import LandingFooter   from "@/components/landing/LandingFooter";

/* ─── SEO ─────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:       "TradeSense Pro — Intelligent Stock Analysis for Indian Markets",
  description: "Multi-indicator signals (RSI, MACD, MA), TradingView charts, FIFO portfolio tracking, and SEBI-accurate Indian profit calculation. Free forever.",
  keywords:    ["stock analysis","TradeSense","RSI","MACD","portfolio","NSE","BSE","signal engine","Indian stocks","intraday"],
  authors:     [{ name: "Alok Kumar Sahu", url: "https://alokkumarsahu.in" }],
  openGraph: {
    title:       "TradeSense Pro — Analyse Stocks. Trade Smarter.",
    description: "Real-time signals, professional charts, and accurate Indian profit calculation — built for Indian retail traders.",
    type:        "website",
    url:         "https://tradesense.alokkumarsahu.in",
    siteName:    "TradeSense Pro",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "TradeSense Pro",
    description: "Multi-indicator signal engine, TradingView charts, SEBI-accurate profit calculation — free forever.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width:            "device-width",
  initialScale:     1,
  minimumScale:     1,
  viewportFit:      "cover",
  themeColor:       "#0B0F14",
};

/* ─── Page ─────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="landing-root bg-[#060A10]">
      {/* Skip to main — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold focus:bg-[#00FFA3] focus:text-[#0B0F14]"
      >
        Skip to main content
      </a>

      <LandingNav />

      <main id="main-content">
        <NewLanding />
      </main>

      <LandingFooter />
    </div>
  );
}
