"use client";
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";
import { Panel, PanelHdr, SkeletonPanel, EmptyPanel } from "./ConsensusEngine";

const TYPE_META: Record<string, { icon:string; color:string; bg:string }> = {
  "Smart Money Entry":           { icon:"🐋", color:"#00FFA3", bg:"rgba(0,255,163,0.08)"  },
  "Distribution — Smart Sell":   { icon:"📤", color:"#EF4444", bg:"rgba(239,68,68,0.08)" },
  "Accumulation — Demand Zone":  { icon:"🏦", color:"#60A5FA", bg:"rgba(96,165,250,0.08)" },
  "Volatility Compression — Coil":{ icon:"🔄", color:"#F59E0B", bg:"rgba(245,158,11,0.08)"},
  "Liquidity Sweep":             { icon:"💧", color:"#A78BFA", bg:"rgba(167,139,250,0.08)"},
  "Buying Pressure":             { icon:"📈", color:"#10B981", bg:"rgba(16,185,129,0.08)" },
  "Retail Flow":                 { icon:"👤", color:"var(--text-muted)", bg:"rgba(255,255,255,0.03)" },
};

export default function InstitutionalActivity() {
  const analytics = useComputedAnalytics();
  if (!analytics) return <EmptyPanel icon="🐋" title="Institutional Detector" />;
  const data = analytics.institutional;
  if (!data) return <SkeletonPanel title="Institutional Detector" />;

  const meta = TYPE_META[data.type] ?? { icon:"📊", color:"var(--text-secondary)", bg:"rgba(255,255,255,0.03)" };

  return (
    <Panel>
      <PanelHdr icon="🐋" title="Institutional Detector" badge={
        <span style={{
          fontSize:"0.58rem", fontWeight:700, letterSpacing:"0.07em",
          color: data.detected ? meta.color : "var(--text-muted)",
          background: data.detected ? meta.bg : "rgba(255,255,255,0.03)",
          border:`1px solid ${data.detected ? meta.color : "var(--border-subtle)"}40`,
          borderRadius:20, padding:"0.12rem 0.55rem",
        }}>
          {data.detected ? "ACTIVE" : "RETAIL"}
        </span>
      } />

      {/* Type card */}
      <div style={{ marginTop:"0.85rem", padding:"0.65rem 0.8rem", borderRadius:10, background:meta.bg, border:`1px solid ${meta.color}25`, display:"flex", alignItems:"center", gap:"0.6rem" }}>
        <span style={{ fontSize:"1.4rem", lineHeight:1 }}>{meta.icon}</span>
        <div>
          <div style={{ fontSize:"0.82rem", fontWeight:700, color:meta.color, lineHeight:1.2 }}>{data.type}</div>
          <div style={{ fontSize:"0.65rem", color:"var(--text-muted)", marginTop:"0.2rem" }}>
            Confidence: <span style={{ color:meta.color, fontFamily:"var(--font-mono)", fontWeight:700 }}>{data.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{ marginTop:"0.75rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.25rem" }}>
          <span style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Detection Confidence</span>
          <span style={{ fontSize:"0.68rem", fontFamily:"var(--font-mono)", color:meta.color }}>{data.confidence}%</span>
        </div>
        <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${data.confidence}%`, background:meta.color, borderRadius:3, boxShadow:`0 0 6px ${meta.color}50`, transition:"width 0.8s ease" }} />
        </div>
      </div>

      {/* Volume ratio */}
      <div style={{ marginTop:"0.75rem", padding:"0.4rem 0.6rem", borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid var(--border-subtle)" }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>Volume vs 20-bar avg</span>
          <span style={{ fontSize:"0.7rem", fontFamily:"var(--font-mono)", fontWeight:700, color: data.volumeRatio > 2 ? "#00FFA3" : data.volumeRatio > 1.3 ? "#F59E0B" : "var(--text-secondary)" }}>
            {data.volumeRatio}×
          </span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden", marginTop:"0.3rem" }}>
          <div style={{ height:"100%", width:`${Math.min(100, (data.volumeRatio / 4) * 100)}%`, background: data.volumeRatio > 2 ? "#00FFA3" : data.volumeRatio > 1.3 ? "#F59E0B" : "#60A5FA", borderRadius:3, transition:"width 0.8s ease" }} />
        </div>
      </div>

      <p style={{ fontSize:"0.67rem", color:"var(--text-muted)", marginTop:"0.6rem", lineHeight:1.55, fontFamily:"var(--font-mono)" }}>
        {data.description}
      </p>
    </Panel>
  );
}
