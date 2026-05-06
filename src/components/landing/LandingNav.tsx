"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TrendingUp, Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features",     href: "#features"     },
  { label: "Preview",      href: "#preview"      },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Us",       href: "#why-us"       },
];

/* Shared container — exactly matches all sections below */
const CONTAINER = "max-w-[1400px] mx-auto px-6 lg:px-8";

export default function LandingNav() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    <>
      {/* ── Fixed bar — full width background, content inside container ── */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={[
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#0B0F14]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
            : "bg-transparent",
        ].join(" ")}
      >
        {/* ── Content aligned to same max-w-7xl as all sections ── */}
        <div className={`${CONTAINER} h-16 flex items-center justify-between`}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={close}>
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0"
              style={{ background: "rgba(0,255,163,0.1)", borderColor: "rgba(0,255,163,0.25)" }}
            >
              <TrendingUp size={15} color="#00FFA3" />
            </span>
            <span className="font-bold text-[15px] text-[#E6EDF3]">
              TradeSense <span className="text-[#00FFA3]">Pro</span>
            </span>
          </Link>

          {/* Desktop nav — centred */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-4 py-2 text-sm rounded-lg text-[#9CA3AF] hover:text-[#E6EDF3] hover:bg-white/[0.05] transition-all duration-200"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="text-sm text-[#9CA3AF] hover:text-[#E6EDF3] px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-lg text-[#0B0F14] bg-[#00FFA3] hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(0,255,163,0.45)] transition-all duration-200"
            >
              Start Free <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[#9CA3AF] hover:text-[#E6EDF3] hover:bg-white/[0.05] transition-all"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer — same container */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className={`md:hidden ${CONTAINER} pb-4`}
            >
              <div className="rounded-2xl bg-[#121826]/98 backdrop-blur-xl border border-white/[0.07] shadow-2xl p-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="px-4 py-3 text-sm rounded-xl text-[#9CA3AF] hover:text-[#E6EDF3] hover:bg-white/[0.05] transition-all"
                    onClick={close}
                  >
                    {label}
                  </a>
                ))}
                <div className="mt-3 pt-3 flex flex-col gap-2 border-t border-white/[0.06]">
                  <Link
                    href="/login"
                    onClick={close}
                    className="px-4 py-3 text-sm text-center rounded-xl text-[#9CA3AF] border border-white/[0.08] hover:bg-white/[0.05] transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="px-4 py-3 text-sm font-bold text-center rounded-xl bg-[#00FFA3] text-[#0B0F14]"
                  >
                    Start Analyzing Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
