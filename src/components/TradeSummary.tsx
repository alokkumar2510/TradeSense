"use client";
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";
import { useMarketStore }        from "@/store/marketStore";
import { PanelHdr, Panel, SkeletonPanel, EmptyPanel } from "./ConsensusEngine";

export default function TradeSummary() {
  const analytics = useComputedAnalytics();
  const symbol    = useMarketStore(s => s.symbol);
  const quote     = useMarketStore(s => s.quote);

  if (!symbol) return <EmptyPanel icon="📋" title="Trade Intelligence" />;
  if (!analytics) return <SkeletonPanel title="Trade Intelligence" />;

  const { consensus, rsi, ema9, ema21, ema50, macd, momentum, risk, emotion } = analytics;
  if (!consensus || rsi === undefined) return <SkeletonPanel title="Trade Intelligence" />;

  const signalColor = {
    STRONG_BUY:"#00FFA3", BUY:"#10B981", HOLD:"#F59E0B",
    SELL:"#F87171", STRONG_SELL:"#EF4444",
  }[consensus.signal] ?? "#6B7280";

  const indicators = [
    { label:"RSI",   value:rsi.toFixed(1),     color: rsi < 35 ? "#00FFA3" : rsi > 65 ? "#EF4444" : "var(--text-primary)" },
    { label:"EMA9",  value:`₹${(ema9??0).toFixed(1)}`,  color: (ema9??0) > (ema21??0) ? "#00FFA3" : "#EF4444" },
    { label:"EMA21", value:`₹${(ema21??0).toFixed(1)}`, color: (ema21??0) > (ema50??0) ? "#10B981" : "#F97316" },
    { label:"MACD Hist", value: macd ? (macd.histogram > 0 ? `+${macd.histogram.toFixed(3)}` : macd.histogram.toFixed(3)) : "—", color: (macd?.histogram??0) > 0 ? "#00FFA3" : "#EF4444" },
  ];

  // Build narrative summary from computed signals
  const emaStruct = (ema9??0) > (ema21??0) && (ema21??0) > (ema50??0) ? "bullish stack (9>21>50)" : (ema9??0) < (ema21??0) ? "bearish alignment" : "mixed EMA";
  const rsiStr    = rsi > 70 ? "overbought territory" : rsi < 30 ? "oversold territory" : rsi > 55 ? "bullish zone" : "neutral zone";
  const momentumStr = momentum ? momentum.phase.split("—")[0].trim() : "unknown";
  const emotionStr  = emotion ? emotion.state.split("—")[0].trim() : "Neutral";

  const tradeSummary = `${symbol} shows ${emaStruct} with RSI at ${rsi.toFixed(1)} (${rsiStr}). ` +
    `MACD histogram ${(macd?.histogram??0) > 0 ? "positive — bullish momentum building" : "negative — selling pressure active"}. ` +
    `Momentum phase: ${momentumStr}. Market emotion: ${emotionStr}. ` +
    `Risk level ${risk?.level ?? "Moderate"} with ATR-based stop at ₹${risk?.stopLoss?.toFixed(2) ?? "—"}. ` +
    `Consensus score ${consensus.score > 0 ? "+" : ""}${consensus.score} → ${consensus.label} with ${consensus.confidence}% confidence.`;

  return (
    <Panel>
      <PanelHdr icon="📋" title="Trade Intelligence" badge={
        <span style={{ fontSize:"0.6rem", color:signalColor, background:`${signalColor}15`, border:`1px solid ${signalColor}40`, borderRadius:20, padding:"0.12rem 0.6rem", fontWeight:700, letterSpacing:"0.07em" }}>
          {consensus.label.toUpperCase()}
        </span>
      } />

      {/* Indicator strip */}
      <div style={{ display:"flex", gap:"0.4rem", marginTop:"0.8rem", marginBottom:"0.75rem" }}>
        {indicators.map(ind => (
          <div key={ind.label} style={{ flex:1, padding:"0.4rem 0.3rem", background:"rgba(255,255,255,0.03)", borderRadius:7, border:"1px solid rgba(255,255,255,0.05)", textAlign:"center" }}>
            <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", marginBottom:"0.12rem", letterSpacing:"0.06em" }}>{ind.label}</div>
            <div style={{ fontSize:"0.72rem", fontFamily:"var(--font-mono)", fontWeight:700, color:ind.color }}>{ind.value}</div>
          </div>
        ))}
      </div>

      {/* Summary paragraph */}
      <div style={{ padding:"0.7rem 0.875rem", borderRadius:8, background:"rgba(255,255,255,0.025)", border:`1px solid ${signalColor}20`, borderLeft:`3px solid ${signalColor}` }}>
        <p style={{ fontSize:"0.78rem", color:"var(--text-secondary)", lineHeight:1.75, margin:0 }}>
          {tradeSummary}
        </p>
      </div>

      <div style={{ marginTop:"0.5rem", fontSize:"0.63rem", color:"var(--text-muted)", textAlign:"right", fontFamily:"var(--font-mono)" }}>
        Updated {new Date().toLocaleTimeString()} · Algorithmic signals only — not financial advice
      </div>
    </Panel>
  );
}
