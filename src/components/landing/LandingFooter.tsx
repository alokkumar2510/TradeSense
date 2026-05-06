"use client";

import Link from "next/link";
import { TrendingUp, ExternalLink } from "lucide-react";

const C = "max-w-[1400px] mx-auto px-6 lg:px-8";

type NavLink = { l: string; h: string; ext?: boolean };
type NavCol = { heading: string; links: NavLink[] };

const NAV: NavCol[] = [
  {
    heading: "Product",
    links: [
      { l: "Features", h: "#features" },
      { l: "How It Works", h: "#how-it-works" },
      { l: "Preview", h: "#preview" },
      { l: "Pricing", h: "#why-us" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { l: "Documentation", h: "#", ext: true },
      { l: "GitHub", h: "https://github.com/alokkumar2510/tradesense", ext: true },
      { l: "Changelog", h: "#", ext: true },
      { l: "API Reference", h: "#", ext: true },
    ],
  },
  {
    heading: "Legal",
    links: [
      { l: "Privacy Policy", h: "#" },
      { l: "Terms of Service", h: "#" },
      { l: "Cookie Policy", h: "#" },
      { l: "SEBI Disclaimer", h: "#" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06]" style={{ background: "#060A10" }}>
      <div className={C}>

        {/*
          Grid layout:
          Mobile  → 1 col stacked (brand then 3 nav groups)
          Tablet  → 2 col
          Desktop → brand(auto) + 3 equal nav columns
        */}
        <div className="footer-grid py-14">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,255,163,0.1)", border: "1px solid rgba(0,255,163,0.2)" }}
              >
                <TrendingUp size={15} color="#00FFA3" />
              </div>
              <span className="text-base font-black text-[#E6EDF3]">TradeSense</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20">
                Pro
              </span>
            </Link>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-5">
              Intelligent stock analysis for Indian retail traders. Real signals, real profits, zero cost.
            </p>

            {/* Social row */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                {
                  href: "https://github.com/alokkumar2510", label: "GitHub",
                  d: "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"
                },
                {
                  href: "https://twitter.com/alok_chintu", label: "𝕏",
                  d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                },
                {
                  href: "https://linkedin.com/in/alok-kumar-sahu-7a7059370", label: "LinkedIn",
                  d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                },
                {
                  href: "https://instagram.com/alokkumar.in_", label: "Instagram",
                  d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                },
                {
                  href: "https://alokkumarsahu.in", label: "Portfolio",
                  d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                },
              ].map(({ href, label, d }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-[#6B7280] hover:text-[#E6EDF3]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden>
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* 3 nav columns */}
          {NAV.map(col => (
            <div key={col.heading}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-4">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map(lk => (
                  <li key={lk.l}>
                    <a
                      href={lk.h}
                      {...(lk.ext === true ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#E6EDF3] transition-colors duration-150 w-fit"
                    >
                      {lk.l}
                      {lk.ext === true && <ExternalLink size={10} strokeOpacity={0.6} />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar — flex justify-between */}
        <div
          className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-[#6B7280] text-center sm:text-left">
            © {new Date().getFullYear()} TradeSense Pro · tradesense.alokkumarsahu.in
          </p>
          <p className="text-xs text-[#6B7280] text-center sm:text-right">
            Not SEBI registered · For educational purposes only
          </p>
        </div>

      </div>
    </footer>
  );
}
