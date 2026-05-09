"use client";
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";
import { Panel, PanelHdr, SkeletonPanel, EmptyPanel } from "./ConsensusEngine";

const LEVEL_META = {
  Safe:       { color:"#00FFA3", bg:"rgba(0,255,163,0.08)",   icon:"🟢", desc:"Low risk — well-defined structure" },
  Moderate:   { color:"#F59E0B", bg:"rgba(245,158,11,0.08)",  icon:"🟡", desc:"Moderate volatility — trade with stops" },
  Aggressive: { color:"#F97316", bg:"rgba(249,115,22,0.08)",  icon:"🟠", desc:"High volatility — reduce position size" },
  Extreme:    { color:"#EF4444", bg:"rgba(239,68,68,0.10)",   icon:"🔴", desc:"Extreme risk — avoid new entries" },
};

function DataCell({ label, value, sub }: { label:string; value:string; sub?:string }) {
  return (
    <div style={{ flex:1, textAlign:"center", padding:"0.5rem 0.25rem", borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid var(--border-subtle)" }}>
      <div style={{ fontSize:"0.65rem", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.2rem" }}>{label}</div>
      <div style={{ fontSize:"0.88rem", fontWeight:800, fontFamily:"var(--font-mono)", color:"var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize:"0.6rem", color:"var(--text-muted)", marginTop:"0.1rem" }}>{sub}</div>}
    </div>
  );
}

export default function RiskEngine({ currentPrice }: { currentPrice?: number }) {
  const analytics = useComputedAnalytics();
  if (!analytics) return <EmptyPanel icon="🛡️" title="Risk Engine" />;
  const data = analytics.risk;
  if (!data) return <SkeletonPanel title="Risk Engine" />;

  const meta = LEVEL_META[data.level] ?? LEVEL_META.Moderate;
  const price = currentPrice ?? 0;

  return (
    <Panel>
      <PanelHdr icon="🛡️" title="Risk Engine" badge={
        <span style={{ fontSize:"0.6rem", fontWeight:700, color:meta.color, background:meta.bg, border:`1px solid ${meta.color}40`, borderRadius:20, padding:"0.12rem 0.6rem", letterSpacing:"0.07em" }}>
          {meta.icon} {data.level.toUpperCase()}
        </span>
      } />

      {/* Risk meter */}
      <div style={{ marginTop:"0.85rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.25rem" }}>
          <span style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Risk Score</span>
          <span style={{ fontSize:"0.68rem", fontFamily:"var(--font-mono)", color:meta.color, fontWeight:700 }}>{data.score}/100</span>
        </div>
        <div style={{ height:8, background:"linear-gradient(90deg, #00FFA3 0%, #F59E0B 50%, #EF4444 100%)", borderRadius:4, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", borderRadius:4 }} />
          <div style={{
            position:"absolute", top:0, bottom:0, left:0, width:`${data.score}%`,
            background:"transparent", borderRight:`2px solid white`, boxShadow:"0 0 8px white",
            transition:"width 0.8s ease",
          }} />
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display:"flex", gap:"0.4rem", marginTop:"0.75rem" }}>
        <DataCell label="ATR %" value={`${data.volatilityPct}%`} sub="volatility" />
        <DataCell label="DD Risk" value={`${data.drawdownRisk}%`} sub="drawdown" />
        <DataCell label="R:R" value={`${data.riskReward}:1`} sub="reward ratio" />
      </div>

      {/* Stop / Target */}
      {data.stopLoss > 0 && (
        <div style={{ display:"flex", gap:"0.4rem", marginTop:"0.4rem" }}>
          <div style={{ flex:1, padding:"0.45rem", borderRadius:8, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", textAlign:"center" }}>
            <div style={{ fontSize:"0.62rem", color:"#F87171", textTransform:"uppercase", letterSpacing:"0.06em" }}>Stop Loss</div>
            <div style={{ fontSize:"0.88rem", fontWeight:800, fontFamily:"var(--font-mono)", color:"#F87171", marginTop:2 }}>
              ₹{data.stopLoss.toLocaleString("en-IN", { minimumFractionDigits:2 })}
            </div>
            {price > 0 && <div style={{ fontSize:"0.6rem", color:"rgba(239,68,68,0.7)" }}>−{((price - data.stopLoss) / price * 100).toFixed(1)}%</div>}
          </div>
          <div style={{ flex:1, padding:"0.45rem", borderRadius:8, background:"rgba(0,255,163,0.06)", border:"1px solid rgba(0,255,163,0.2)", textAlign:"center" }}>
            <div style={{ fontSize:"0.62rem", color:"#00FFA3", textTransform:"uppercase", letterSpacing:"0.06em" }}>Target</div>
            <div style={{ fontSize:"0.88rem", fontWeight:800, fontFamily:"var(--font-mono)", color:"#00FFA3", marginTop:2 }}>
              ₹{data.targetPrice.toLocaleString("en-IN", { minimumFractionDigits:2 })}
            </div>
            {price > 0 && <div style={{ fontSize:"0.6rem", color:"rgba(0,255,163,0.7)" }}>+{((data.targetPrice - price) / price * 100).toFixed(1)}%</div>}
          </div>
        </div>
      )}

      <p style={{ fontSize:"0.67rem", color:"var(--text-muted)", marginTop:"0.6rem", lineHeight:1.5, fontFamily:"var(--font-mono)" }}>
        {meta.desc}. Stops based on 1.5× ATR(14).
      </p>
    </Panel>
  );
}
