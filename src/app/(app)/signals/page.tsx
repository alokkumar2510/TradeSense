"use client";

import { useMarketStore } from "@/store/marketStore";
import type { AnalysisResult, StockQuote } from "@/types";
import { Zap, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, Clock } from "lucide-react";

type Signal = {
  id: string;
  engine: string;
  type: "BUY" | "SELL" | "NEUTRAL";
  confidence: number;
  description: string;
  timeframe: string;
};

function deriveSignals(analysis: AnalysisResult | null, quote: StockQuote | null): Signal[] {
  if (!analysis || !quote) return [];
  const signals: Signal[] = [];

  // Consensus
  const sig = analysis.consensus.signal;
  signals.push({
    id: "consensus",
    engine: "Consensus Engine",
    type: ["STRONG_BUY", "BUY"].includes(sig) ? "BUY" : ["SELL", "STRONG_SELL"].includes(sig) ? "SELL" : "NEUTRAL",
    confidence: analysis.consensus.confidence ?? 50,
    description: `Aggregate score: ${analysis.consensus.score}/100. Signal: ${sig.replace("_", " ")}.`,
    timeframe: "Multi-TF",
  });

  // RSI
  const rsi = analysis.rsi ?? 50;
  if (rsi > 70) {
    signals.push({ id: "rsi-ob", engine: "RSI Oscillator", type: "SELL", confidence: Math.min((rsi - 70) * 3, 100), description: `RSI at ${rsi.toFixed(1)} — overbought territory. Possible reversal ahead.`, timeframe: "1D" });
  } else if (rsi < 30) {
    signals.push({ id: "rsi-os", engine: "RSI Oscillator", type: "BUY",  confidence: Math.min((30 - rsi) * 3, 100), description: `RSI at ${rsi.toFixed(1)} — oversold. Mean-reversion opportunity.`, timeframe: "1D" });
  } else {
    signals.push({ id: "rsi-n",  engine: "RSI Oscillator", type: "NEUTRAL", confidence: 50, description: `RSI at ${rsi.toFixed(1)} — neutral range.`, timeframe: "1D" });
  }

  // Momentum phase
  const mom = analysis.momentum;
  const momType = mom.exhaustion ? "SELL" : mom.strength > 60 ? "BUY" : mom.strength < 30 ? "SELL" : "NEUTRAL";
  signals.push({
    id: "momentum",
    engine: "Momentum Engine",
    type: momType,
    confidence: mom.strength ?? 50,
    description: `Phase: ${mom.phase}. Strength: ${mom.strength.toFixed(0)}/100. Acceleration: ${mom.acceleration > 0 ? "+" : ""}${mom.acceleration.toFixed(2)}.`,
    timeframe: "Weekly",
  });

  // Risk
  const risk = analysis.risk;
  const riskType = risk.level === "Safe" ? "BUY" : risk.level === "Extreme" ? "SELL" : "NEUTRAL";
  signals.push({
    id: "risk",
    engine: "Risk Engine",
    type: riskType,
    confidence: risk.level === "Safe" ? 80 : risk.level === "Extreme" ? 85 : 50,
    description: `Risk: ${risk.level}. R/R: ${risk.riskReward?.toFixed(2) ?? "—"}. Stop: ₹${risk.stopLoss?.toFixed(2) ?? "—"}, Target: ₹${risk.targetPrice?.toFixed(2) ?? "—"}.`,
    timeframe: "Position",
  });

  return signals;
}

function SignalCard({ sig }: { sig: Signal }) {
  const [col, bg, Icon] =
    sig.type === "BUY"  ? ["var(--green)",  "rgba(74,222,128,0.08)", TrendingUp]   :
    sig.type === "SELL" ? ["var(--red)",    "rgba(248,113,113,0.08)", TrendingDown] :
                          ["var(--yellow)", "rgba(250,204,21,0.06)", Minus];

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: `1px solid ${col}30`,
      borderLeft: `3px solid ${col}`,
      borderRadius: "var(--r-md)",
      padding: "12px 14px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={13} style={{ color: col }} />
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: col, letterSpacing: "0.05em" }}>{sig.type}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={11} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{sig.timeframe}</span>
        </div>
      </div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-primary)" }}>{sig.engine}</div>
      <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{sig.description}</div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>Confidence</span>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: col }}>{sig.confidence.toFixed(0)}%</span>
        </div>
        <div style={{ height: 3, background: "var(--bg-elevated)", borderRadius: 2 }}>
          <div style={{ width: `${sig.confidence}%`, height: "100%", background: col, borderRadius: 2, transition: "width 0.8s ease" }} />
        </div>
      </div>
    </div>
  );
}

function NoSymbol() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Zap size={40} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)" }}>No symbol selected</div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
          Search a stock in the top bar to generate signals
        </div>
      </div>
    </div>
  );
}

export default function SignalsPage() {
  const symbol   = useMarketStore(s => s.symbol);
  const quote    = useMarketStore(s => s.quote);
  const analysis = useMarketStore(s => s.analysis);

  if (!symbol || !quote) return <NoSymbol />;

  const signals = deriveSignals(analysis, quote);
  const buyCount  = signals.filter(s => s.type === "BUY").length;
  const sellCount = signals.filter(s => s.type === "SELL").length;
  const totalConf = signals.length > 0 ? signals.reduce((a, s) => a + s.confidence, 0) / signals.length : 0;

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Signals — <span style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>{symbol}</span>
          </h1>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, marginTop: 2 }}>Engine-generated trading signals from live analytics</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="live-dot" />
          <span style={{ fontSize: "0.65rem", color: "var(--green)", fontWeight: 700, letterSpacing: "0.08em" }}>LIVE</span>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Total Signals",    value: String(signals.length),          color: "var(--blue)" },
          { label: "Buy Signals",      value: String(buyCount),                color: "var(--green)" },
          { label: "Sell Signals",     value: String(sellCount),               color: "var(--red)" },
          { label: "Avg Confidence",   value: `${totalConf.toFixed(0)}%`,      color: "var(--purple)" },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: k.color }}>{k.value}</div>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Signal cards */}
      {signals.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {signals.map(sig => <SignalCard key={sig.id} sig={sig} />)}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
          <Info size={14} style={{ color: "var(--blue)", flexShrink: 0 }} />
          Analysis is loading. Signals will appear once the analytics engine finishes processing.
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "var(--r-md)", fontSize: "0.62rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>These are AI-generated signals for educational purposes only. Not financial advice. Always do your own due diligence before trading.</span>
      </div>
    </div>
  );
}
