"use client";
import type { StockQuote } from "@/types";

interface Props { quote: StockQuote }

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
      <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
      <span style={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)", fontWeight: 600, color: color ?? "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function fmt(n: number) {
  if (!n && n !== 0) return "—";
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(2)}Cr`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtVol(n: number) {
  if (!n) return "—";
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)}L`;
  return n.toLocaleString("en-IN");
}

export default function StockStats({ quote }: Props) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
      gap: "0.5rem",
      padding: "0.875rem 1.25rem",
      background: "var(--bg-card)",
      borderRadius: 12,
      border: "1px solid var(--border-subtle)",
    }}>
      <Stat label="Open"       value={quote.open ? `₹${quote.open.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"} />
      <Stat label="High"       value={quote.high ? `₹${quote.high.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"} color="#00FFA3" />
      <Stat label="Low"        value={quote.low  ? `₹${quote.low.toLocaleString("en-IN",  { minimumFractionDigits: 2 })}` : "—"} color="#EF4444" />
      <Stat label="Volume"     value={fmtVol(quote.volume)} />
      <Stat label="Mkt Cap"    value={fmt(quote.marketCap)} />
      <Stat label="P/E Ratio"  value={quote.pe ? quote.pe.toFixed(1) : "—"} />
      <Stat label="Currency"   value={quote.currency || "INR"} />
      <Stat label="Exchange"   value={quote.exchange} />
    </div>
  );
}
