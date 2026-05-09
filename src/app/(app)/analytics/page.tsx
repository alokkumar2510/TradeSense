"use client";

import { useMarketStore } from "@/store/marketStore";
import {
  BarChart3, Target, Shield, Zap, TrendingUp,
  Activity, Info, AlertTriangle
} from "lucide-react";

function ScoreMeter({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize: "0.82rem", fontWeight: 800, fontFamily: "var(--font-mono)", color }}>{value}</span>
      </div>
      <div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px",
      borderRadius: 3, border: `1px solid ${color}`,
      color, background: `${color}15`, letterSpacing: "0.06em",
    }}>{label}</span>
  );
}

function NoSymbol() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <BarChart3 size={40} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)" }}>No symbol selected</div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
          Search for a stock in the top bar to view analytics
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const symbol   = useMarketStore(s => s.symbol);
  const quote    = useMarketStore(s => s.quote);
  const analysis = useMarketStore(s => s.analysis);

  if (!symbol || !quote) return <NoSymbol />;

  const consensus = analysis?.consensus;
  const momentum  = analysis?.momentum;
  const risk      = analysis?.risk;

  const signalColor = !consensus ? "var(--text-muted)"
    : ["STRONG_BUY", "BUY"].includes(consensus.signal) ? "var(--green)"
    : ["SELL", "STRONG_SELL"].includes(consensus.signal) ? "var(--red)"
    : "var(--yellow)";

  const riskColor = !risk ? "var(--text-muted)"
    : risk.level === "Safe" ? "var(--green)"
    : risk.level === "Extreme" ? "var(--red)"
    : risk.level === "Aggressive" ? "var(--orange, #f97316)"
    : "var(--yellow)";

  const pc = quote.changePercent ?? 0;
  const priceColor = pc >= 0 ? "var(--green)" : "var(--red)";

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Analytics — <span style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>{symbol}</span>
          </h1>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, marginTop: 2 }}>
            Deep signal analysis & engine outputs
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {consensus && <Badge label={consensus.signal} color={signalColor} />}
          {risk && <Badge label={`RISK: ${risk.level}`} color={riskColor} />}
        </div>
      </div>

      {/* Top KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Price",        value: `₹${quote.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: priceColor },
          { label: "Day Change",   value: `${pc >= 0 ? "+" : ""}${pc.toFixed(2)}%`,    color: priceColor },
          { label: "Day High",     value: `₹${quote.high.toFixed(2)}`,  color: "var(--green)" },
          { label: "Day Low",      value: `₹${quote.low.toFixed(2)}`,   color: "var(--red)" },
        ].map(k => (
          <div key={k.label} style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-dim)",
            borderRadius: "var(--r-md)",
            padding: "12px 14px",
          }}>
            <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Consensus Engine */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Target size={14} style={{ color: "var(--blue)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Consensus Engine</span>
          </div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: signalColor }}>
              {consensus?.score ?? "—"}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>/ 100 consensus score</div>
            <div style={{ marginTop: 8 }}>
              {consensus && <Badge label={consensus.signal} color={signalColor} />}
            </div>
          </div>
          <ScoreMeter value={consensus?.confidence ?? 0} label="Confidence" color="var(--blue)" />
        </div>

        {/* Momentum Engine */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <TrendingUp size={14} style={{ color: "var(--purple)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Momentum Engine</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ScoreMeter value={momentum?.strength ?? 0}    label="Momentum Strength" color="var(--purple)" />
            <ScoreMeter value={analysis?.rsi ?? 50}        label="RSI (14)"          color={
              (analysis?.rsi ?? 50) > 70 ? "var(--red)" :
              (analysis?.rsi ?? 50) < 30 ? "var(--green)" : "var(--yellow)"
            } />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Phase</span>
              <Badge label={momentum?.phase ?? "—"} color="var(--purple)" />
            </div>
          </div>
        </div>

        {/* Risk Engine */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Shield size={14} style={{ color: riskColor }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Risk Engine</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ScoreMeter value={risk?.score ?? 50}           label="Risk Score"  color={riskColor} />
            <ScoreMeter value={risk?.volatilityPct ?? 0}   label="Volatility %" color="var(--orange, #f97316)" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Risk Level</span>
              {risk && <Badge label={risk.level} color={riskColor} />}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Indicators (MACD / EMA from AnalysisResult) */}
      {analysis && (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Activity size={14} style={{ color: "var(--green)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>Technical Indicators</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {([
              { k: "RSI (14)",    v: analysis.rsi },
              { k: "MACD",       v: analysis.macd?.macd },
              { k: "MACD Signal",v: analysis.macd?.signal },
              { k: "Histogram",  v: analysis.macd?.histogram },
              { k: "EMA 9",      v: analysis.ema9 },
              { k: "EMA 21",     v: analysis.ema21 },
              { k: "EMA 50",     v: analysis.ema50 },
            ] as { k: string; v?: number | null }[]).map(({ k, v }) => v != null && (
              <div key={k} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                  {(v as number).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info notice when no analysis */}
      {!analysis && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
          background: "var(--blue-muted)", border: "1px solid rgba(77,159,255,0.2)",
          borderRadius: "var(--r-md)", fontSize: "0.72rem", color: "var(--text-secondary)",
        }}>
          <Info size={14} style={{ color: "var(--blue)", flexShrink: 0 }} />
          Analysis data is loading. Switch to the Dashboard tab to trigger data fetch, then return here.
        </div>
      )}
    </div>
  );
}
