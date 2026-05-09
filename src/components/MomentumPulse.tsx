"use client";
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";
import { Panel, PanelHdr, SkeletonPanel, EmptyPanel } from "./ConsensusEngine";

const PHASE_COLORS: Record<string, string> = {
  "Expansion":   "#00FFA3",
  "Continuation":"#10B981",
  "Neutral":     "#F59E0B",
  "Compression": "#60A5FA",
  "Reversal":    "#F97316",
  "Exhaustion":  "#EF4444",
};

function getPhaseColor(phase: string) {
  for (const [key, color] of Object.entries(PHASE_COLORS)) {
    if (phase.startsWith(key)) return color;
  }
  return "var(--text-secondary)";
}

function GaugeArc({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const r = 28, circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.abs(value) / max);
  return (
    <svg width={70} height={70} viewBox="0 0 70 70" style={{ transform:"rotate(-90deg)" }}>
      <circle cx={35} cy={35} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
      <circle cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={circ - pct * circ} strokeLinecap="round"
        style={{ filter:`drop-shadow(0 0 5px ${color}80)`, transition:"stroke-dashoffset 0.7s ease" }} />
    </svg>
  );
}

export default function MomentumPulse() {
  const analytics = useComputedAnalytics();
  if (!analytics) return <EmptyPanel icon="🌊" title="Momentum Pulse" />;
  const data = analytics.momentum;
  if (!data) return <SkeletonPanel title="Momentum Pulse" />;

  const phaseColor = getPhaseColor(data.phase);
  const acclColor  = data.acceleration >= 0 ? "#00FFA3" : "#EF4444";
  const acclLabel  = data.acceleration >= 0 ? "Accelerating" : "Decelerating";

  return (
    <Panel>
      <PanelHdr icon="🌊" title="Momentum Pulse" badge={
        data.exhaustion && (
          <span style={{ fontSize:"0.58rem", color:"#EF4444", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:20, padding:"0.12rem 0.55rem", fontWeight:700 }}>
            EXHAUSTION
          </span>
        )
      } />

      {/* Phase label */}
      <div style={{ marginTop:"0.85rem", padding:"0.5rem 0.75rem", borderRadius:8, background:`${phaseColor}10`, border:`1px solid ${phaseColor}30` }}>
        <span style={{ fontSize:"0.78rem", fontWeight:700, color:phaseColor, letterSpacing:"0.04em" }}>{data.phase}</span>
      </div>

      {/* Dual gauges */}
      <div style={{ display:"flex", gap:"0.75rem", alignItems:"center", marginTop:"0.85rem" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ position:"relative" }}>
            <GaugeArc value={data.strength} color={phaseColor} />
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:"0.9rem", fontWeight:800, fontFamily:"var(--font-mono)", color:phaseColor, lineHeight:1 }}>{data.strength}</span>
            </div>
          </div>
          <span style={{ fontSize:"0.6rem", color:"var(--text-muted)", letterSpacing:"0.08em" }}>STRENGTH</span>
        </div>

        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.25rem" }}>
            <span style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Acceleration</span>
            <span style={{ fontSize:"0.68rem", fontFamily:"var(--font-mono)", color:acclColor, fontWeight:700 }}>
              {data.acceleration > 0 ? "+" : ""}{data.acceleration} — {acclLabel}
            </span>
          </div>
          <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", left:"50%", width:1, height:"100%", background:"rgba(255,255,255,0.2)" }} />
            <div style={{
              height:"100%", width:`${Math.abs(data.acceleration)}%`,
              position:"absolute", [data.acceleration >= 0 ? "left" : "right"]:"50%",
              background:acclColor, boxShadow:`0 0 6px ${acclColor}60`, transition:"width 0.7s ease",
            }} />
          </div>

          <p style={{ fontSize:"0.67rem", color:"var(--text-muted)", marginTop:"0.75rem", lineHeight:1.5, fontFamily:"var(--font-mono)" }}>
            {data.description}
          </p>
        </div>
      </div>
    </Panel>
  );
}
