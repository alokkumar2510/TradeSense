"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  LayoutDashboard, TrendingUp, Star, BriefcaseBusiness,
  BarChart3, Zap, Settings, LogOut, ChevronLeft,
  Activity, Bell, Search
} from "lucide-react";
import { useMarketStore } from "@/store/marketStore";
import { workerApi } from "@/lib/workerApi";

/* ─── nav items ───────────────────────────────────────────────────── */
const NAV = [
  { href:"/dashboard",  label:"Dashboard",  icon:LayoutDashboard, desc:"Command center" },
  { href:"/markets",    label:"Markets",    icon:TrendingUp,       desc:"Live market data" },
  { href:"/watchlist",  label:"Watchlist",  icon:Star,             desc:"Your symbols" },
  { href:"/portfolio",  label:"Portfolio",  icon:BriefcaseBusiness,desc:"P&L tracker" },
  { href:"/analytics",  label:"Analytics",  icon:BarChart3,        desc:"Deep signals" },
  { href:"/signals",    label:"Signals",    icon:Zap,              desc:"Engine outputs" },
];

/* ─── Global Search ────────────────────────────────────────────────── */
function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ symbol: string; name: string; exchangeShortName: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const setSymbol = useMarketStore(s => s.setSymbol);
  const reset = useMarketStore(s => s.reset);
  const router = useRouter();

  const fetchStock = useCallback((sym: string) => {
    if (!sym.trim()) return;
    reset(); setSymbol(sym.trim().toUpperCase());
    router.push("/dashboard");
  }, [reset, setSymbol, router]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDrop(false); return; }
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await workerApi.search(query);
      if (res.ok) setResults((res.data as any[]).slice(0, 8));
      setSearching(false); setShowDrop(true);
    }, 350);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [query]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = (sym: string) => {
    setQuery(""); setShowDrop(false); fetchStock(sym);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { fetchStock(query.trim()); setQuery(""); setShowDrop(false); }
  };

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", width: 280 }} ref={dropRef}>
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", padding: "4px 8px", flex: 1, gap: 8, transition: "border-color 0.15s" }}>
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input 
          type="text" 
          placeholder="Search symbol (e.g. RELIANCE)..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "0.75rem", flex: 1, width: "100%" }} 
          autoComplete="off"
        />
      </form>
      {showDrop && (results.length > 0 || searching) && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", padding: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", zIndex: 100 }}>
          {searching ? (
            <div style={{ padding: "8px", fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
              <div className="spinner" style={{ width: 12, height: 12 }} /> Searching...
            </div>
          ) : (
            results.map(r => (
              <button key={r.symbol} onClick={() => handleSelect(r.symbol)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 8px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: "var(--r-xs)", color: "var(--text-primary)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, overflow: "hidden" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{r.symbol}</span>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                </div>
                <span style={{ fontSize: "0.55rem", color: "var(--blue)", background: "var(--blue-muted)", padding: "2px 4px", borderRadius: "2px" }}>{r.exchangeShortName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const quote = useMarketStore(s => s.quote);
  const symbol = useMarketStore(s => s.symbol);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg-base)" }}>
        <div className="spinner" style={{ width:24, height:24 }} />
      </div>
    );
  }

  const pc = quote?.changePercent ?? 0;
  const priceColor = pc > 0 ? "var(--green)" : pc < 0 ? "var(--red)" : "var(--text-secondary)";

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"var(--bg-base)" }}>

      {/* ══════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════ */}
      <aside style={{
        width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-w)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-dim)",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        zIndex: 30,
      }}>

        {/* Logo row */}
        <div style={{ display:"flex", alignItems:"center", height:"var(--topbar-h)", padding:"0 14px", borderBottom:"1px solid var(--border-dim)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
            <div className="live-dot" />
            {!collapsed && (
              <span style={{ fontSize:"0.82rem", fontWeight:800, letterSpacing:"0.05em", color:"var(--text-primary)", whiteSpace:"nowrap" }}>
                TRADESENSE<span style={{ color:"var(--green)" }}>PRO</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", padding:4, display:"flex", borderRadius:4, flexShrink:0, transition:"color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <ChevronLeft size={14} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition:"transform 0.25s" }} />
          </button>
        </div>

        {/* Active symbol pill */}
        {symbol && !collapsed && (
          <div style={{ margin:"8px 10px", padding:"6px 10px", background:"var(--bg-elevated)", borderRadius:"var(--r-md)", border:"1px solid var(--border-subtle)", flexShrink:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:"0.72rem", fontWeight:800, fontFamily:"var(--font-mono)", color:"var(--text-primary)" }}>{symbol}</span>
              <span style={{ fontSize:"0.68rem", fontFamily:"var(--font-mono)", fontWeight:700, color:priceColor }}>
                {pc >= 0 ? "+" : ""}{pc.toFixed(2)}%
              </span>
            </div>
            {quote && (
              <div style={{ fontSize:"0.78rem", fontWeight:800, fontFamily:"var(--font-mono)", color:priceColor, marginTop:2 }}>
                ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits:2 })}
              </div>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex:1, padding:"6px 6px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {NAV.map(({ href, label, icon:Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} style={{
                display:"flex", alignItems:"center", gap:10,
                padding: collapsed ? "9px 13px" : "8px 12px",
                borderRadius:"var(--r-md)",
                background: active ? "var(--blue-muted)" : "transparent",
                border: `1px solid ${active ? "rgba(77,159,255,0.2)" : "transparent"}`,
                color: active ? "var(--blue)" : "var(--text-secondary)",
                textDecoration:"none",
                transition:"all 0.15s ease",
                whiteSpace:"nowrap",
                overflow:"hidden",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background="var(--bg-hover)"; e.currentTarget.style.color="var(--text-primary)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-secondary)"; } }}
              >
                <Icon size={15} style={{ flexShrink:0 }} />
                {!collapsed && <span style={{ fontSize:"0.8rem", fontWeight:500 }}>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user area */}
        <div style={{ padding:"8px 6px", borderTop:"1px solid var(--border-dim)", flexShrink:0, display:"flex", flexDirection:"column", gap:2 }}>
          <Link href="/settings" style={{
            display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
            borderRadius:"var(--r-md)", color:"var(--text-muted)", textDecoration:"none", transition:"all 0.15s", whiteSpace:"nowrap", overflow:"hidden",
          }}
          onMouseEnter={e => { e.currentTarget.style.color="var(--text-primary)"; e.currentTarget.style.background="var(--bg-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.background="transparent"; }}
          >
            <Settings size={14} style={{ flexShrink:0 }} />
            {!collapsed && <span style={{ fontSize:"0.78rem" }}>Settings</span>}
          </Link>

          {!collapsed && (
            <div style={{ padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{
                width:26, height:26, borderRadius:"50%",
                background:"linear-gradient(135deg, var(--blue-dim), var(--purple))",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.65rem", fontWeight:800, color:"#fff", flexShrink:0,
              }}>
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {user.email?.split("@")[0]}
                </div>
                <div style={{ fontSize:"0.6rem", color:"var(--text-muted)" }}>Pro</div>
              </div>
              <button onClick={() => logout?.()} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex", padding:4, borderRadius:4 }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* Top live bar */}
        <header style={{
          height:"var(--topbar-h)", flexShrink:0,
          display:"flex", alignItems:"center",
          background:"var(--bg-surface)",
          borderBottom:"1px solid var(--border-dim)",
          padding:"0 16px", gap:16, zIndex: 50, position: "relative"
        }}>
          {/* Global Search */}
          <GlobalSearch />

          <div style={{ flex: 1 }} />

          {/* Live ticker summary */}
          {quote ? (
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:"0.78rem", fontWeight:800, fontFamily:"var(--font-mono)", color:"var(--text-primary)" }}>{quote.symbol}</span>
              <span style={{ fontSize:"0.82rem", fontWeight:800, fontFamily:"var(--font-mono)", color:priceColor }}>
                ₹{quote.price.toLocaleString("en-IN", { minimumFractionDigits:2 })}
              </span>
              <span style={{ fontSize:"0.7rem", fontFamily:"var(--font-mono)", color:priceColor }}>
                {pc >= 0 ? "▲" : "▼"} {Math.abs(pc).toFixed(2)}%
              </span>
              <span style={{ fontSize:"0.62rem", color:"var(--text-muted)", background:"var(--bg-elevated)", padding:"0.1rem 0.4rem", borderRadius:"var(--r-xs)", border:"1px solid var(--border-dim)" }}>
                {quote.exchange}
              </span>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div className="live-dot" style={{ background: "var(--text-muted)", boxShadow: "none" }} />
              <span style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>No symbol active</span>
            </div>
          )}

          <div style={{ marginLeft:16, paddingLeft: 16, borderLeft: "1px solid var(--border-dim)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.65rem", color:"var(--green)" }}>
              <div className="live-dot" style={{ width:5, height:5 }} />
              <span style={{ fontFamily:"var(--font-mono)", fontWeight:700, letterSpacing:"0.08em" }}>LIVE</span>
            </div>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", display:"flex", padding:4 }}>
              <Bell size={14} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {mounted ? children : (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div className="spinner" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
