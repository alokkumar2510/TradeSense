"use client";
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";

/* ─── Primitives ─────────────────────────────────────────────── */
export function PanelHdr({ icon, title, badge }: { icon:string; title:string; badge?:React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
      <span style={{ fontSize:"0.72rem" }}>{icon}</span>
      <span style={{ fontSize:"0.6rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{title}</span>
      {badge && <span style={{ marginLeft:"auto" }}>{badge}</span>}
    </div>
  );
}

export function Panel({ children }: { children:React.ReactNode }) {
  return <div>{children}</div>;
}

export function SkeletonPanel({ title }:{ title:string }) {
  return (
    <Panel>
      <PanelHdr icon="⚡" title={title} />
      <div style={{ height:60, borderRadius:4 }} className="skeleton" />
    </Panel>
  );
}

export function EmptyPanel({ title, icon="⚡" }:{ title:string; icon?:string }) {
  return (
    <Panel>
      <PanelHdr icon={icon} title={title} />
      <p style={{ fontSize:"0.7rem", color:"var(--text-muted)" }}>Search a symbol to activate.</p>
    </Panel>
  );
}

function Bar({ pct, color }:{ pct:number; color:string }) {
  return (
    <div className="prog-track">
      <div className="prog-fill" style={{ width:`${Math.min(100,pct)}%`, background:color, boxShadow:`0 0 6px ${color}60` }} />
    </div>
  );
}

function Row({ label, value, color }:{ label:string; value:string; color?:string }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"2px 0", borderBottom:"1px solid var(--border-dim)" }}>
      <span style={{ fontSize:"0.62rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{label}</span>
      <span style={{ fontSize:"0.64rem", color:color??"var(--text-secondary)", fontFamily:"var(--font-mono)", fontWeight:700 }}>{value}</span>
    </div>
  );
}

/* ─── Signal colors ──────────────────────────────────────────── */
const SIG: Record<string,{ text:string; bg:string; ring:string }> = {
  STRONG_BUY:  { text:"var(--green)",  bg:"var(--green-muted)",  ring:"rgba(0,255,178,0.3)" },
  BUY:         { text:"#00C487",       bg:"rgba(0,196,135,0.12)", ring:"rgba(0,196,135,0.3)" },
  HOLD:        { text:"var(--amber)",  bg:"var(--amber-muted)",  ring:"rgba(255,179,71,0.3)" },
  SELL:        { text:"#FF6B35",       bg:"rgba(255,107,53,0.12)",ring:"rgba(255,107,53,0.3)" },
  STRONG_SELL: { text:"var(--red)",    bg:"var(--red-muted)",    ring:"rgba(255,68,85,0.3)" },
};

/* ─── 1. Consensus Engine ────────────────────────────────────── */
export default function ConsensusEngine() {
  const a = useComputedAnalytics();
  if (!a) return <EmptyPanel icon="⚡" title="Consensus" />;
  const d = a.consensus;
  if (!d) return <SkeletonPanel title="Consensus" />;
  const c = SIG[d.signal] ?? SIG.HOLD;
  const circ = 2 * Math.PI * 30;

  return (
    <Panel>
      <PanelHdr icon="⚡" title="Consensus Engine" badge={
        <span style={{ fontSize:"0.56rem", fontWeight:800, color:c.text, background:c.bg, border:`1px solid ${c.ring}`, borderRadius:3, padding:"0.1rem 0.45rem", letterSpacing:"0.08em" }}>
          {d.label.toUpperCase()}
        </span>
      } />

      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
        {/* SVG gauge */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <svg width={68} height={68} viewBox="0 0 68 68" style={{ transform:"rotate(-90deg)" }}>
            <circle cx={34} cy={34} r={30} fill="none" stroke="var(--border-dim)" strokeWidth={7} />
            <circle cx={34} cy={34} r={30} fill="none" stroke={c.text} strokeWidth={7}
              strokeDasharray={circ} strokeDashoffset={circ - (d.buyProb / 100) * circ}
              strokeLinecap="round" style={{ filter:`drop-shadow(0 0 4px ${c.text}80)`, transition:"stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:"0.95rem", fontWeight:800, color:c.text, fontFamily:"var(--font-mono)", lineHeight:1 }}>{d.buyProb}%</span>
            <span style={{ fontSize:"0.5rem", color:"var(--text-muted)", letterSpacing:"0.1em" }}>BUY</span>
          </div>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontSize:"0.6rem", color:"var(--text-muted)" }}>Score</span>
            <span style={{ fontSize:"0.62rem", fontFamily:"var(--font-mono)", fontWeight:700, color:c.text }}>{d.score > 0 ? "+" : ""}{d.score}</span>
          </div>
          <div style={{ height:5, background:"var(--border-dim)", borderRadius:3, overflow:"hidden", position:"relative", marginBottom:6 }}>
            <div style={{ position:"absolute", left:"50%", width:1, height:"100%", background:"var(--border-base)" }} />
            <div style={{ height:"100%", width:`${Math.abs(d.score) / 2}%`, position:"absolute", [d.score >= 0 ? "left":"right"]:"50%",
              background: d.score >= 0 ? "var(--green)" : "var(--red)", transition:"width 0.8s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontSize:"0.6rem", color:"var(--text-muted)" }}>Confidence</span>
            <span style={{ fontSize:"0.62rem", fontFamily:"var(--font-mono)", color:"var(--text-secondary)" }}>{d.confidence}%</span>
          </div>
          <Bar pct={d.confidence} color={c.text} />
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {d.factors.slice(0,7).map(f => (
          <Row key={f.name} label={f.name} value={f.value}
            color={f.bias==="bull" ? "var(--green)" : f.bias==="bear" ? "var(--red)" : "var(--text-secondary)"} />
        ))}
      </div>
    </Panel>
  );
}
