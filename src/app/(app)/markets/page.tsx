"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Activity, Globe,
  BarChart2, RefreshCw, ArrowUpRight, ArrowDownRight
} from "lucide-react";

// ─── Static market index data (replace with live API when available) ──────────
const INDICES = [
  { name: "NIFTY 50",      symbol: "^NSEI",  value: "22,530.70", change: +1.23,  region: "IN" },
  { name: "SENSEX",        symbol: "^BSESN", value: "74,119.39", change: +1.18,  region: "IN" },
  { name: "NIFTY BANK",    symbol: "^NSEBANK",value:"48,201.10",  change: -0.32,  region: "IN" },
  { name: "S&P 500",       symbol: "^GSPC",  value: "5,214.08",  change: +0.51,  region: "US" },
  { name: "NASDAQ",        symbol: "^IXIC",  value: "16,340.87", change: +0.82,  region: "US" },
  { name: "DOW JONES",     symbol: "^DJI",   value: "38,852.27", change: +0.20,  region: "US" },
  { name: "NIKKEI 225",    symbol: "^N225",  value: "37,703.33", change: -0.61,  region: "JP" },
  { name: "FTSE 100",      symbol: "^FTSE",  value: "8,213.49",  change: +0.44,  region: "UK" },
];

const SECTORS = [
  { name: "IT",            change: +2.10, cap: "₹14.2T" },
  { name: "Banking",       change: -0.42, cap: "₹22.8T" },
  { name: "Energy",        change: +1.75, cap: "₹18.6T" },
  { name: "Pharma",        change: +0.93, cap: "₹9.4T"  },
  { name: "Auto",          change: -0.18, cap: "₹8.1T"  },
  { name: "FMCG",          change: +0.62, cap: "₹11.3T" },
  { name: "Metal",         change: -1.24, cap: "₹5.8T"  },
  { name: "Realty",        change: +3.41, cap: "₹3.2T"  },
];

const TOP_GAINERS = [
  { symbol: "TATAPOWER",  name: "Tata Power",        price: "432.50", change: +5.82 },
  { symbol: "ADANIPORTS", name: "Adani Ports",       price: "1,423.80", change: +4.63 },
  { symbol: "IRFC",       name: "Indian Railway Fin", price: "212.40", change: +4.10 },
  { symbol: "RECLTD",     name: "REC Limited",        price: "562.30", change: +3.87 },
  { symbol: "POWERGRID",  name: "Power Grid Corp",    price: "324.70", change: +3.21 },
];

const TOP_LOSERS = [
  { symbol: "HDFCBANK",   name: "HDFC Bank",          price: "1,608.40", change: -2.14 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance",       price: "7,204.10", change: -1.95 },
  { symbol: "SUNPHARMA",  name: "Sun Pharma",          price: "1,441.20", change: -1.42 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever",  price: "2,330.70", change: -0.91 },
  { symbol: "CIPLA",      name: "Cipla",               price: "1,412.60", change: -0.78 },
];

function change_color(c: number) {
  return c > 0 ? "var(--green)" : c < 0 ? "var(--red)" : "var(--text-muted)";
}

function IndexCard({ idx }: { idx: typeof INDICES[0] }) {
  const col = change_color(idx.change);
  const Arrow = idx.change >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-dim)",
      borderRadius: "var(--r-md)",
      padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 6,
      transition: "border-color 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-dim)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>{idx.name}</span>
        <span style={{ fontSize: "0.58rem", background: "var(--bg-elevated)", color: "var(--text-muted)", padding: "1px 5px", borderRadius: 3 }}>{idx.region}</span>
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
        {idx.value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: col, fontSize: "0.72rem", fontWeight: 700 }}>
        <Arrow size={13} />
        {idx.change > 0 ? "+" : ""}{idx.change.toFixed(2)}%
      </div>
    </div>
  );
}

function SectorBar({ s }: { s: typeof SECTORS[0] }) {
  const col = change_color(s.change);
  const w = Math.min(Math.abs(s.change) * 15, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", width: 70, flexShrink: 0 }}>{s.name}</span>
      <div style={{ flex: 1, height: 4, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${w}%`, height: "100%", background: col, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: col, width: 52, textAlign: "right" }}>
        {s.change > 0 ? "+" : ""}{s.change.toFixed(2)}%
      </span>
      <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", width: 50, textAlign: "right" }}>{s.cap}</span>
    </div>
  );
}

function MoverRow({ m, type }: { m: typeof TOP_GAINERS[0], type: "gain" | "loss" }) {
  const col = type === "gain" ? "var(--green)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "7px 12px", borderRadius: "var(--r-xs)", gap: 8 }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{m.symbol}</div>
        <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>₹{m.price}</div>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: col }}>{m.change > 0 ? "+" : ""}{m.change.toFixed(2)}%</div>
      </div>
    </div>
  );
}

export default function MarketsPage() {
  const [lastUpdate, setLastUpdate] = useState("");
  useEffect(() => { setLastUpdate(new Date().toLocaleTimeString("en-IN")); }, []);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Market Overview</h1>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, marginTop: 2 }}>Global indices, sectors & top movers</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.68rem", color: "var(--text-muted)" }}>
          <RefreshCw size={12} />
          <span>Updated {lastUpdate}</span>
        </div>
      </div>

      {/* Global Indices */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Globe size={14} style={{ color: "var(--blue)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Global Indices</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {INDICES.map(idx => <IndexCard key={idx.symbol} idx={idx} />)}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Sectors */}
        <section style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-dim)",
          borderRadius: "var(--r-md)",
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <BarChart2 size={14} style={{ color: "var(--purple)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Sector Performance</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SECTORS.map(s => <SectorBar key={s.name} s={s} />)}
          </div>
        </section>

        {/* Top Gainers */}
        <section style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-dim)",
          borderRadius: "var(--r-md)",
          padding: "14px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "0 12px" }}>
            <TrendingUp size={14} style={{ color: "var(--green)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Top Gainers</span>
          </div>
          {TOP_GAINERS.map(m => <MoverRow key={m.symbol} m={m} type="gain" />)}
        </section>

        {/* Top Losers */}
        <section style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-dim)",
          borderRadius: "var(--r-md)",
          padding: "14px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "0 12px" }}>
            <TrendingDown size={14} style={{ color: "var(--red)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Top Losers</span>
          </div>
          {TOP_LOSERS.map(m => <MoverRow key={m.symbol} m={m} type="loss" />)}
        </section>
      </div>

      {/* Market Mood */}
      <section style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-dim)",
        borderRadius: "var(--r-md)",
        padding: "14px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Activity size={14} style={{ color: "var(--yellow)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Market Breadth</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Advances",     value: "1,284", color: "var(--green)" },
            { label: "Declines",     value: "736",   color: "var(--red)" },
            { label: "Unchanged",    value: "94",    color: "var(--text-muted)" },
            { label: "52W Highs",    value: "78",    color: "var(--blue)" },
          ].map(m => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: m.color }}>{m.value}</div>
              <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
