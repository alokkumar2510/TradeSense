"use client";

import type { StockQuote } from "@/types";
import styles from "./StockStats.module.css";

interface Props { quote: StockQuote; }

export default function StockStats({ quote }: Props) {
  const stats = [
    { label: "Open",       value: `₹${fmt(quote.open)}` },
    { label: "High",       value: `₹${fmt(quote.high)}` },
    { label: "Low",        value: `₹${fmt(quote.low)}` },
    { label: "Volume",     value: formatVolume(quote.volume) },
    { label: "Market Cap", value: formatMarketCap(quote.marketCap) },
    { label: "P/E Ratio",  value: quote.pe > 0 ? quote.pe.toFixed(2) : "N/A" },
  ];

  return (
    <div className={`stat-grid ${styles.grid}`}>
      {stats.map(({ label, value }) => (
        <div key={label} className={`card ${styles.stat}`}>
          <span className={styles.label}>{label}</span>
          <span className={`${styles.value} mono`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

function formatMarketCap(mc: number): string {
  if (!mc) return "N/A";
  if (mc >= 1e12) return `₹${(mc / 1e12).toFixed(2)}T`;
  if (mc >= 1e9)  return `₹${(mc / 1e9).toFixed(2)}B`;
  if (mc >= 1e6)  return `₹${(mc / 1e6).toFixed(2)}M`;
  return `₹${mc.toLocaleString("en-IN")}`;
}
