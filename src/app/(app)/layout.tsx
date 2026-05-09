"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Star, BriefcaseBusiness,
  BarChart3, Zap, Settings, LogOut, Search, FlaskConical,
  RotateCcw, Bell, ChevronRight, Activity, Cpu, Globe,
  X, Shield, Gamepad2
} from "lucide-react";
import { useMarketStore } from "@/store/marketStore";
import { workerApi } from "@/lib/workerApi";

/* ─── Nav config ─────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard, color: "#3D8EFF" },
  { href: "/markets",      label: "Markets",       icon: Globe,           color: "#00D4CC" },
  { href: "/strategy-lab", label: "Strategy Lab",  icon: FlaskConical,    color: "#9B7FFF" },
  { href: "/replay",       label: "Replay",        icon: RotateCcw,       color: "#FFB340" },
  { href: "/paper-trade",  label: "Paper Trade",   icon: Gamepad2,        color: "#00ff88" },
  { href: "/portfolio",    label: "Portfolio",     icon: BriefcaseBusiness, color: "#00FFB2" },
  { href: "/signals",      label: "Signals",       icon: Zap,             color: "#FFB340" },
  { href: "/analytics",    label: "Analytics",     icon: BarChart3,       color: "#3D8EFF" },
  { href: "/watchlist",    label: "Watchlist",     icon: Star,            color: "#00FFB2" },
  { href: "/settings",     label: "Settings",      icon: Settings,        color: "#6A7E98" },
];

/* ─── Market ticker bar data ─────────────────────────────────────── */
/* ─── Live index hook ───────────────────────────────────────────── */
const INDEX_SYMS = [
  { label: "NIFTY 50",   sym: "^NSEI"  },
  { label: "SENSEX",     sym: "^BSESN" },
  { label: "BANK NIFTY", sym: "^NSEBANK" },
  { label: "USD/INR",    sym: "USDINR=X" },
  { label: "GOLD",       sym: "GC=F"   },
  { label: "CRUDE OIL",  sym: "CL=F"   },
];

interface IndexTick { label: string; value: string; change: string; up: boolean; }

function useLiveIndices() {
  const [ticks, setTicks] = useState<IndexTick[]>(
    INDEX_SYMS.map(s => ({ label: s.label, value: "—", change: "—", up: true }))
  );

  useEffect(() => {
    let active = true;
    const fetch = async () => {
      const results = await Promise.allSettled(
        INDEX_SYMS.map(s => workerApi.quote(s.sym))
      );
      if (!active) return;
      setTicks(results.map((r, i) => {
        if (r.status === "fulfilled" && r.value.ok) {
          const q = r.value.data as { price: number; changePercent: number };
          const pc = q.changePercent ?? 0;
          return {
            label: INDEX_SYMS[i].label,
            value: q.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: `${pc >= 0 ? "+" : ""}${pc.toFixed(2)}%`,
            up: pc >= 0,
          };
        }
        return { label: INDEX_SYMS[i].label, value: "—", change: "—", up: true };
      }));
    };
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => { active = false; clearInterval(id); };
  }, []);

  return ticks;
}

/* ─── Market status (IST hours) ─────────────────────────────────── */
function useMarketStatus() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const day = ist.getDay();  // 0=Sun, 6=Sat
      const h = ist.getHours(), m = ist.getMinutes();
      const mins = h * 60 + m;
      setOpen(day >= 1 && day <= 5 && mins >= 555 && mins < 930); // 9:15–15:30
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);
  return open;
}

/* ─── Global Search ─────────────────────────────────────────────── */
function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<{ symbol: string; name: string; exchangeShortName: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const debRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const setSymbol = useMarketStore(s => s.setSymbol);
  const reset     = useMarketStore(s => s.reset);
  const router    = useRouter();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await workerApi.search(query);
      if (res.ok) setResults((res.data as any[]).slice(0, 8));
      setSearching(false);
    }, 320);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [query]);

  const handleSelect = (sym: string) => {
    reset(); setSymbol(sym.toUpperCase());
    router.push("/dashboard");
    onClose?.();
  };

  return (
    <div style={{ width: "100%", maxWidth: 520 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-base)",
        borderRadius: "var(--r-md)",
        padding: "8px 12px",
      }}>
        <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search symbol, company, or market…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "var(--text-primary)", fontSize: "0.82rem",
            flex: 1, fontFamily: "var(--font-mono)",
          }}
          autoComplete="off"
        />
        {searching && <div className="spinner" style={{ width: 12, height: 12 }} />}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              marginTop: 6,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--r-md)",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {results.map((r, i) => (
              <button
                key={r.symbol}
                onClick={() => handleSelect(r.symbol)}
                style={{
                  display: "flex", alignItems: "center", width: "100%",
                  padding: "8px 12px", background: "transparent", border: "none",
                  textAlign: "left", cursor: "pointer",
                  borderTop: i > 0 ? "1px solid var(--border-dim)" : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)", minWidth: 90 }}>
                  {r.symbol}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.name}
                </span>
                <span style={{ fontSize: "0.58rem", color: "var(--blue)", background: "var(--blue-muted)", padding: "2px 5px", borderRadius: "var(--r-xs)", border: "1px solid rgba(61,142,255,0.2)", marginLeft: 8, flexShrink: 0 }}>
                  {r.exchangeShortName}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Search Modal ──────────────────────────────────────────────── */
function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(3,6,14,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            paddingTop: "15vh",
          }}
        >
          <motion.div
            initial={{ scale: 0.97, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: -8 }}
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 540, padding: "0 16px" }}
          >
            <GlobalSearch onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────── */
function Sidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const quote  = useMarketStore(s => s.quote);
  const symbol = useMarketStore(s => s.symbol);

  const pc = quote?.changePercent ?? 0;
  const priceColor = pc > 0 ? "var(--green)" : pc < 0 ? "var(--red)" : "var(--text-secondary)";

  return (
    <motion.aside
      animate={{ width: expanded ? 210 : 52 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{
        flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-dim)",
        overflow: "hidden", zIndex: 40,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div style={{
        height: "var(--topbar-h)", display: "flex", alignItems: "center",
        padding: "0 14px", borderBottom: "1px solid var(--border-dim)",
        flexShrink: 0, gap: 10,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: "var(--r-sm)",
          background: "linear-gradient(135deg, #3D8EFF, #9B7FFF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, position: "relative",
        }}>
          <Activity size={12} color="#fff" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.04em", color: "var(--text-primary)", whiteSpace: "nowrap" }}
            >
              TRADE<span style={{ color: "var(--green)" }}>SENSE</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Active symbol pill */}
      <AnimatePresence>
        {symbol && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ margin: "6px 8px 0", padding: "6px 8px", background: "var(--bg-elevated)", borderRadius: "var(--r-md)", border: "1px solid var(--border-subtle)", flexShrink: 0 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{symbol}</span>
              <span style={{ fontSize: "0.66rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: priceColor }}>
                {pc >= 0 ? "+" : ""}{pc.toFixed(2)}%
              </span>
            </div>
            {quote && (
              <div style={{ fontSize: "0.75rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: priceColor, marginTop: 2 }}>
                ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 6px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: expanded ? "8px 10px" : "8px 14px",
                borderRadius: "var(--r-md)",
                background: active ? `rgba(${color === "#3D8EFF" ? "61,142,255" : color === "#00FFB2" ? "0,255,178" : color === "#9B7FFF" ? "155,127,255" : "61,142,255"},0.08)` : "transparent",
                border: `1px solid ${active ? `rgba(${color === "#3D8EFF" ? "61,142,255" : color === "#00FFB2" ? "0,255,178" : "61,142,255"},0.15)` : "transparent"}`,
                color: active ? color : "var(--text-muted)",
                textDecoration: "none",
                transition: "all 0.12s",
                whiteSpace: "nowrap", overflow: "hidden",
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; } }}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    style={{ fontSize: "0.78rem", fontWeight: active ? 600 : 400 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User area */}
      <div style={{ padding: "6px", borderTop: "1px solid var(--border-dim)", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 8px", borderRadius: "var(--r-md)",
          overflow: "hidden",
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--blue-dim), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.6rem", fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email?.split("@")[0]}
                </div>
                <div style={{ fontSize: "0.58rem", color: "var(--green)", display: "flex", alignItems: "center", gap: 3 }}>
                  <Shield size={8} /> PRO
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {expanded && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => logout?.()}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4, borderRadius: 4 }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <LogOut size={12} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: expanded ? "flex-end" : "center",
            padding: "4px 8px", background: "none", border: "none", cursor: "pointer",
            color: "var(--text-dim)", borderRadius: "var(--r-sm)", transition: "color 0.12s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
        >
          <ChevronRight size={12} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.22s" }} />
        </button>
      </div>
    </motion.aside>
  );
}

/* ─── Top Market Bar ─────────────────────────────────────────────── */
function MarketBar({ onSearchOpen }: { onSearchOpen: () => void }) {
  const quote   = useMarketStore(s => s.quote);
  const symbol  = useMarketStore(s => s.symbol);
  const [now, setNow] = useState("");
  const indices = useLiveIndices();
  const marketOpen = useMarketStatus();

  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pc = quote?.changePercent ?? 0;
  const priceColor = pc > 0 ? "var(--green)" : pc < 0 ? "var(--red)" : "var(--text-secondary)";

  return (
    <header style={{
      height: "var(--topbar-h)", flexShrink: 0,
      display: "flex", alignItems: "center",
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-dim)",
      zIndex: 50, position: "relative",
      overflow: "hidden",
    }}>
      {/* Search trigger */}
      <button
        onClick={onSearchOpen}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 12px", height: "100%",
          background: "none", border: "none", cursor: "pointer",
          borderRight: "1px solid var(--border-dim)",
          color: "var(--text-muted)", transition: "color 0.12s",
          flexShrink: 0, minWidth: 200,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <Search size={12} />
        <span style={{ fontSize: "0.72rem" }}>Search symbol…</span>
        <span style={{ marginLeft: "auto", fontSize: "0.6rem", padding: "1px 5px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--r-xs)", color: "var(--text-muted)" }}>⌘K</span>
      </button>

      {/* Active symbol */}
      {quote && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 14px", borderRight: "1px solid var(--border-dim)",
          flexShrink: 0, height: "100%",
        }}>
          <div className="live-dot" style={{ width: 5, height: 5 }} />
          <span style={{ fontSize: "0.76rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{quote.symbol}</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: priceColor }}>
            ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: "0.66rem", fontFamily: "var(--font-mono)", color: priceColor }}>
            {pc >= 0 ? "▲" : "▼"} {Math.abs(pc).toFixed(2)}%
          </span>
        </div>
      )}

      {/* Scrolling market indices */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", height: "100%" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          position: "absolute", left: 0, top: 0, bottom: 0,
          animation: "ticker-scroll 40s linear infinite",
          whiteSpace: "nowrap",
        }}>
          {[...indices, ...indices].map((idx, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 16px", height: "100%",
                borderRight: "1px solid var(--border-dim)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>{idx.label}</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{idx.value}</span>
              <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-mono)", color: idx.up ? "var(--green)" : "var(--red)" }}>{idx.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right cluster */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        borderLeft: "1px solid var(--border-dim)", flexShrink: 0, height: "100%",
      }}>
        {/* Market status */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "0 12px", height: "100%",
          borderRight: "1px solid var(--border-dim)",
        }}>
          <div className={marketOpen ? "live-dot" : undefined} style={{ width: 5, height: 5, borderRadius: "50%", background: marketOpen ? "var(--green)" : "var(--red)" }} />
          <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", color: marketOpen ? "var(--green)" : "var(--red)" }}>{marketOpen ? "NSE OPEN" : "NSE CLOSED"}</span>
        </div>

        {/* Clock */}
        <div style={{ padding: "0 12px", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid var(--border-dim)" }}>
          <span style={{ fontSize: "0.66rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{now}</span>
        </div>

        {/* Notification */}
        <button style={{
          padding: "0 12px", height: "100%",
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", display: "flex", alignItems: "center",
          transition: "color 0.12s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <Bell size={13} />
        </button>
      </div>
    </header>
  );
}

/* ─── Root App Shell ─────────────────────────────────────────────── */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchOpen, setSearchOpen]           = useState(false);
  const [mounted, setMounted]                 = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-base)",
        flexDirection: "column", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "var(--r-lg)",
          background: "linear-gradient(135deg, #3D8EFF, #9B7FFF)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Activity size={18} color="#fff" />
        </div>
        <div className="spinner" style={{ width: 20, height: 20 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(e => !e)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <MarketBar onSearchOpen={() => setSearchOpen(true)} />

        {/* Page content */}
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {mounted ? children : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spinner" />
            </div>
          )}
        </main>
      </div>

      {/* Search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
