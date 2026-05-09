"use client";
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";
import { Panel, PanelHdr, SkeletonPanel, EmptyPanel } from "./PanelPrimitives";

const STATE_META: Record<string, { emoji:string; color:string; bg:string; barColor:string }> = {
  "Panic — Market Stress":     { emoji:"😱", color:"#EF4444", bg:"rgba(239,68,68,0.10)",  barColor:"#EF4444"  },
  "Euphoria — Extreme Greed":  { emoji:"🤑", color:"#00FFA3", bg:"rgba(0,255,163,0.09)",  barColor:"#00FFA3"  },
  "Fear — Risk Off":           { emoji:"😰", color:"#F97316", bg:"rgba(249,115,22,0.09)", barColor:"#F97316"  },
  "Greed — Risk On":           { emoji:"😈", color:"#A78BFA", bg:"rgba(167,139,250,0.09)",barColor:"#A78BFA"  },
  "Calm Consolidation":        { emoji:"😐", color:"#60A5FA", bg:"rgba(96,165,250,0.09)", barColor:"#60A5FA"  },
  "Volatility — Indecision":   { emoji:"😵", color:"#F59E0B", bg:"rgba(245,158,11,0.09)", barColor:"#F59E0B"  },
  "Neutral — Balanced":        { emoji:"🧘", color:"#94A3B8", bg:"rgba(148,163,184,0.07)",barColor:"#94A3B8"  },
};

function GaugePair({ fear, greed }: { fear:number; greed:number }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.4rem", marginTop:"0.7rem" }}>
      {/* Fear */}
      <div style={{ padding:"0.5rem", borderRadius:8, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.15)" }}>
        <div style={{ fontSize:"0.62rem", color:"#F87171", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.25rem" }}>Fear Index</div>
        <div style={{ fontSize:"1.1rem", fontWeight:800, fontFamily:"var(--font-mono)", color:"#F87171", lineHeight:1 }}>{fear}</div>
        <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden", marginTop:"0.4rem" }}>
          <div style={{ height:"100%", width:`${fear}%`, background:"#EF4444", borderRadius:2, transition:"width 0.8s ease" }} />
        </div>
      </div>
      {/* Greed */}
      <div style={{ padding:"0.5rem", borderRadius:8, background:"rgba(0,255,163,0.06)", border:"1px solid rgba(0,255,163,0.15)" }}>
        <div style={{ fontSize:"0.62rem", color:"#00FFA3", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.25rem" }}>Greed Index</div>
        <div style={{ fontSize:"1.1rem", fontWeight:800, fontFamily:"var(--font-mono)", color:"#00FFA3", lineHeight:1 }}>{greed}</div>
        <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden", marginTop:"0.4rem" }}>
          <div style={{ height:"100%", width:`${greed}%`, background:"#00FFA3", borderRadius:2, transition:"width 0.8s ease" }} />
        </div>
      </div>
    </div>
  );
}

export default function EmotionEngine() {
  const analytics = useComputedAnalytics();
  if (!analytics) return <EmptyPanel icon="🧠" title="Emotion Engine" />;
  const data = analytics.emotion;
  if (!data) return <SkeletonPanel title="Emotion Engine" />;

  const meta = STATE_META[data.state] ?? STATE_META["Neutral — Balanced"];

  return (
    <Panel>
      <PanelHdr icon="🧠" title="Emotion Engine" />

      {/* State card */}
      <div style={{ marginTop:"0.85rem", display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.7rem 0.85rem", borderRadius:10, background:meta.bg, border:`1px solid ${meta.color}25` }}>
        <span style={{ fontSize:"2rem", lineHeight:1 }}>{meta.emoji}</span>
        <div>
          <div style={{ fontSize:"0.85rem", fontWeight:800, color:meta.color, lineHeight:1.2 }}>{data.state}</div>
          <div style={{ fontSize:"0.65rem", color:"var(--text-muted)", marginTop:"0.15rem" }}>Market sentiment analysis</div>
        </div>
      </div>

      {/* Fear/Greed gauges */}
      <GaugePair fear={data.fearScore} greed={data.greedScore} />

      {/* Net sentiment bar */}
      <div style={{ marginTop:"0.75rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.2rem" }}>
          <span style={{ fontSize:"0.67rem", color:"#F87171" }}>↑ Fear</span>
          <span style={{ fontSize:"0.67rem", color:"var(--text-muted)" }}>Sentiment Balance</span>
          <span style={{ fontSize:"0.67rem", color:"#00FFA3" }}>Greed ↑</span>
        </div>
        <div style={{ height:8, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", left:"50%", width:1, height:"100%", background:"rgba(255,255,255,0.25)" }} />
          {data.greedScore > data.fearScore ? (
            <div style={{ position:"absolute", left:"50%", width:`${(data.greedScore - data.fearScore) / 2}%`, height:"100%", background:"#00FFA3", boxShadow:"0 0 6px rgba(0,255,163,0.5)", transition:"width 0.8s ease" }} />
          ) : (
            <div style={{ position:"absolute", right:"50%", width:`${(data.fearScore - data.greedScore) / 2}%`, height:"100%", background:"#EF4444", boxShadow:"0 0 6px rgba(239,68,68,0.5)", transition:"width 0.8s ease" }} />
          )}
        </div>
      </div>

      <p style={{ fontSize:"0.67rem", color:"var(--text-muted)", marginTop:"0.6rem", lineHeight:1.55, fontFamily:"var(--font-mono)" }}>
        {data.description}
      </p>
    </Panel>
  );
}
