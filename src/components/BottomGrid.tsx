"use client";
/**
 * BottomGrid — 4 compact cells that live below the chart
 * ① Live Stats  ② Momentum Pulse  ③ Institutional Activity  ④ Signal Timeline
 */
import { useComputedAnalytics } from "@/hooks/useComputedAnalytics";
import { useMarketStore }       from "@/store/marketStore";
import styles from "@/app/(app)/dashboard/dashboard.module.css";

// ─── helpers ──────────────────────────────────────────────────────
function fmtVol(n: number) {
  if (!n) return "—";
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)}L`;
  return n.toLocaleString("en-IN");
}

function fmtCap(n: number) {
  if (!n) return "—";
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(2)}Cr`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function Tick({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"2.5px 0", borderBottom:"1px solid var(--border-dim)" }}>
      <span style={{ fontSize:"0.62rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)" }}>{label}</span>
      <span style={{ fontSize:"0.65rem", fontFamily:"var(--font-mono)", fontWeight:700, color: color ?? "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

// ─── Cell 1: Live Stats ───────────────────────────────────────────
export function LiveStatsCell() {
  const quote     = useMarketStore(s => s.quote);
  const analytics = useComputedAnalytics();

  return (
    <div className={styles.stripCell}>
      <div className={styles.cellHdr}>
        <span style={{ color:"var(--green)" }}>◉</span> Live Stats
      </div>
      {!quote ? (
        <p style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>—</p>
      ) : (
        <>
          <Tick label="Open"   value={`₹${quote.open?.toFixed(2) ?? "—"}`} />
          <Tick label="High"   value={`₹${quote.high?.toFixed(2) ?? "—"}`} color="#00FFA3" />
          <Tick label="Low"    value={`₹${quote.low?.toFixed(2) ?? "—"}`}  color="#EF4444" />
          <Tick label="Volume" value={fmtVol(quote.volume)} />
          <Tick label="Mkt Cap" value={fmtCap(quote.marketCap)} />
          <Tick label="P/E"    value={quote.pe ? quote.pe.toFixed(1) : "—"} />
          {analytics?.rsi !== undefined && (
            <Tick label="RSI(14)" value={analytics.rsi.toFixed(1)}
              color={analytics.rsi > 65 ? "#EF4444" : analytics.rsi < 35 ? "#00FFA3" : "var(--text-primary)"} />
          )}
          {analytics?.macd && (
            <Tick label="MACD Hist" value={(analytics.macd.histogram > 0 ? "+" : "") + analytics.macd.histogram.toFixed(3)}
              color={analytics.macd.histogram > 0 ? "#00FFA3" : "#EF4444"} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Cell 2: Momentum Pulse ───────────────────────────────────────
const PHASE_COL: Record<string, string> = {
  Expansion:"#00FFA3", Continuation:"#10B981", Neutral:"#F59E0B",
  Compression:"#60A5FA", Reversal:"#F97316", Exhaustion:"#EF4444",
};

function phaseColor(phase: string) {
  for (const [k, v] of Object.entries(PHASE_COL)) if (phase.startsWith(k)) return v;
  return "#8B95A5";
}

export function MomentumCell() {
  const analytics = useComputedAnalytics();
  const data = analytics?.momentum;

  return (
    <div className={styles.stripCell}>
      <div className={styles.cellHdr}>
        <span style={{ color:"var(--blue)" }}>〜</span> Momentum
      </div>
      {!data ? (
        <p style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Load a symbol</p>
      ) : (
        <>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color:phaseColor(data.phase), marginBottom:"0.4rem", lineHeight:1.3 }}>
            {data.phase}
          </div>

          {/* Strength bar */}
          <div style={{ marginBottom:"0.35rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.15rem" }}>
              <span style={{ fontSize:"0.6rem", color:"var(--text-muted)" }}>Strength</span>
              <span style={{ fontSize:"0.62rem", fontFamily:"var(--font-mono)", color:phaseColor(data.phase) }}>{data.strength}</span>
            </div>
            <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${data.strength}%`, background:phaseColor(data.phase), transition:"width 0.7s ease", borderRadius:2 }} />
            </div>
          </div>

          {/* Acceleration */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"0.6rem", color:"var(--text-muted)" }}>Acceleration</span>
            <span style={{ fontSize:"0.65rem", fontFamily:"var(--font-mono)", color: data.acceleration >= 0 ? "#00FFA3" : "#EF4444", fontWeight:700 }}>
              {data.acceleration >= 0 ? "+" : ""}{data.acceleration}
            </span>
          </div>

          {data.exhaustion && (
            <div style={{ marginTop:"0.3rem", fontSize:"0.6rem", color:"#EF4444", background:"rgba(239,68,68,0.1)", borderRadius:4, padding:"0.2rem 0.4rem", display:"inline-block" }}>
              ⚠ EXHAUSTION
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Cell 3: Institutional Activity ──────────────────────────────
const TYPE_COL: Record<string, string> = {
  "Smart Money Entry":"#00FFA3", "Distribution — Smart Sell":"#EF4444",
  "Accumulation — Demand Zone":"#60A5FA", "Volatility Compression — Coil":"#F59E0B",
  "Liquidity Sweep":"#A78BFA", "Buying Pressure":"#10B981", "Retail Flow":"#4B5563",
};

export function InstitutionalCell() {
  const analytics = useComputedAnalytics();
  const data = analytics?.institutional;
  const color = data ? (TYPE_COL[data.type] ?? "#8B95A5") : "#8B95A5";

  return (
    <div className={styles.stripCell}>
      <div className={styles.cellHdr}>
        <span style={{ color:"var(--purple)" }}>🐋</span> Institutional
      </div>
      {!data ? (
        <p style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Load a symbol</p>
      ) : (
        <>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color, marginBottom:"0.35rem", lineHeight:1.3 }}>
            {data.type}
          </div>

          {/* Confidence */}
          <div style={{ marginBottom:"0.35rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.15rem" }}>
              <span style={{ fontSize:"0.6rem", color:"var(--text-muted)" }}>Confidence</span>
              <span style={{ fontSize:"0.62rem", fontFamily:"var(--font-mono)", color }}>{data.confidence}%</span>
            </div>
            <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${data.confidence}%`, background:color, transition:"width 0.7s ease", borderRadius:2 }} />
            </div>
          </div>

          <Tick label="Vol Ratio" value={`${data.volumeRatio}×`}
            color={data.volumeRatio > 2 ? "#00FFA3" : data.volumeRatio > 1.3 ? "#F59E0B" : "var(--text-primary)"} />

          <div style={{ marginTop:"0.25rem", fontSize:"0.6rem", color:"var(--text-muted)", lineHeight:1.4 }}>
            {data.description.split(".")[0]}.
          </div>
        </>
      )}
    </div>
  );
}

// ─── Cell 4: Signal Timeline ──────────────────────────────────────
export function SignalTimelineCell() {
  const analytics = useComputedAnalytics();
  const quote     = useMarketStore(s => s.quote);

  if (!analytics || !quote) {
    return (
      <div className={styles.stripCell}>
        <div className={styles.cellHdr}><span style={{ color:"var(--amber)" }}>⚡</span> Signal Timeline</div>
        <p style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>Load a symbol</p>
      </div>
    );
  }

  const { consensus, momentum, risk, emotion } = analytics;
  const now = new Date();
  const timeStr = (offset: number) => {
    const d = new Date(now.getTime() - offset * 1000);
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  };

  const signals: { color:string; text:string; t:number }[] = [];

  if (consensus) {
    const col = { STRONG_BUY:"#00FFA3", BUY:"#10B981", HOLD:"#F59E0B", SELL:"#F97316", STRONG_SELL:"#EF4444" }[consensus.signal] ?? "#8B95A5";
    signals.push({ color:col, text:`Consensus: ${consensus.label} (${consensus.score > 0 ? "+" : ""}${consensus.score}, ${consensus.confidence}% conf)`, t:0 });
  }
  if (momentum) {
    const col = phaseColor(momentum.phase);
    signals.push({ color:col, text:`Momentum: ${momentum.phase} | Str ${momentum.strength}`, t:30 });
  }
  if (risk) {
    const col = { Safe:"#00FFA3", Moderate:"#F59E0B", Aggressive:"#F97316", Extreme:"#EF4444" }[risk.level];
    signals.push({ color:col, text:`Risk: ${risk.level} (ATR ${risk.volatilityPct}%) · Stop ₹${risk.stopLoss.toFixed(0)}`, t:60 });
  }
  if (emotion) {
    const col = emotion.fearScore > emotion.greedScore ? "#F97316" : "#00FFA3";
    signals.push({ color:col, text:`Emotion: ${emotion.state} · Fear ${emotion.fearScore} / Greed ${emotion.greedScore}`, t:90 });
  }

  return (
    <div className={styles.stripCell}>
      <div className={styles.cellHdr}><span style={{ color:"var(--amber)" }}>⚡</span> Signal Timeline</div>
      <div style={{ overflow:"hidden", flex:1 }}>
        {signals.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, padding:"3px 0", borderBottom:"1px solid var(--border-dim)" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:s.color, boxShadow:`0 0 4px ${s.color}`, flexShrink:0, marginTop:4 }} />
            <span style={{ fontSize:"0.63rem", color:"var(--text-secondary)", flex:1, lineHeight:1.4 }}>{s.text}</span>
            <span style={{ fontSize:"0.58rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)", flexShrink:0 }}>{timeStr(s.t)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
