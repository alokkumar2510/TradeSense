"use client";
import { useEffect, useRef, useState } from "react";
export { Panel, PanelHdr, SkeletonPanel, EmptyPanel } from "./PanelPrimitives";
import { useMarketStore } from "@/store/marketStore";
import {
  computeConsensus, simulateTFBars,
  type ConsensusOutput, type SignalLabel, type TFKey,
} from "@/lib/consensusEngine";

/* ── Helpers ───────────────────────────────────────────────────── */
const SIGNAL_CFG: Record<SignalLabel, { label: string; color: string; glow: string; score: number }> = {
  STRONG_BUY:  { label: "STRONG BUY",  color: "#00ff88", glow: "0 0 20px #00ff8855", score:  2 },
  BUY:         { label: "BUY",         color: "#4ade80", glow: "0 0 12px #4ade8040", score:  1 },
  NEUTRAL:     { label: "NEUTRAL",     color: "#94a3b8", glow: "none",               score:  0 },
  SELL:        { label: "SELL",        color: "#f87171", glow: "0 0 12px #f8717140", score: -1 },
  STRONG_SELL: { label: "STRONG SELL", color: "#ff3b6b", glow: "0 0 20px #ff3b6b55", score: -2 },
};

const TF_LABELS: TFKey[] = ["5m","15m","1H","4H","1D"];

function signalIcon(s: SignalLabel) {
  if (s === "STRONG_BUY") return "⬆⬆";
  if (s === "BUY")         return "⬆";
  if (s === "STRONG_SELL") return "⬇⬇";
  if (s === "SELL")        return "⬇";
  return "→";
}

/* ── Arc gauge ─────────────────────────────────────────────────── */
function ArcGauge({ value, max = 100, color, label, size = 80 }: {
  value: number; max?: number; color: string; label: string; size?: number;
}) {
  const pct = Math.min(Math.max(value, 0), max) / max;
  const r = size * 0.38; const cx = size / 2; const cy = size / 2;
  const startA = -200 * (Math.PI / 180);
  const endA   = 20  * (Math.PI / 180);
  const sweep  = endA - startA;
  const arc = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });
  const trackEnd = arc(endA);
  const trackStart = arc(startA);
  const fillEnd = arc(startA + sweep * pct);

  const trackD = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`;
  const fillD  = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} style={{ overflow:"visible" }}>
        <path d={trackD} fill="none" stroke="#1e293b" strokeWidth={size * 0.08} strokeLinecap="round" />
        <path d={fillD}  fill="none" stroke={color}   strokeWidth={size * 0.08} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
        <text x={cx} y={cy * 1.05} textAnchor="middle" fill={color}
              fontSize={size * 0.2} fontFamily="'JetBrains Mono',monospace" fontWeight={700}>
          {value}
        </text>
      </svg>
      <span style={{ fontSize:9, color:"#64748b", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</span>
    </div>
  );
}

/* ── Signal bar ────────────────────────────────────────────────── */
function SignalBar({ score }: { score: number }) {
  const pct = ((score + 100) / 200) * 100;
  const color = score > 20 ? "#00ff88" : score < -20 ? "#ff3b6b" : "#94a3b8";
  return (
    <div style={{ position:"relative", height:6, background:"#0f172a", borderRadius:3, overflow:"hidden" }}>
      <div style={{
        position:"absolute", left:"50%", width:2, height:"100%", background:"#334155", transform:"translateX(-50%)"
      }} />
      <div style={{
        position:"absolute",
        left:  score >= 0 ? "50%" : `${pct}%`,
        width: `${Math.abs(score) / 2}%`,
        height:"100%", background:color,
        borderRadius:3,
        boxShadow:`0 0 6px ${color}80`,
        transition:"width 0.6s ease, left 0.6s ease",
      }} />
    </div>
  );
}

/* ── TF Row ────────────────────────────────────────────────────── */
function TFRow({ tf, signal, score, rsi, macdBias, emaBias }: {
  tf: TFKey; signal: SignalLabel; score: number; rsi: number;
  macdBias: string; emaBias: string;
}) {
  const cfg = SIGNAL_CFG[signal];
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"36px 90px 1fr 42px 56px 56px",
      alignItems:"center", gap:6, padding:"5px 8px",
      borderRadius:4, background:"#0a1628",
      border:`1px solid ${cfg.color}18`,
      transition:"border-color 0.4s",
    }}>
      <span style={{ fontFamily:"mono", fontSize:9, color:"#64748b", fontWeight:700 }}>{tf}</span>
      <span style={{
        fontSize:9, fontWeight:800, letterSpacing:"0.08em",
        color: cfg.color, textShadow: cfg.glow,
      }}>{signalIcon(signal)} {cfg.label}</span>
      <SignalBar score={score} />
      <span style={{ fontSize:9, fontFamily:"mono", color: rsi > 70 ? "#f87171" : rsi < 30 ? "#4ade80" : "#94a3b8", textAlign:"right" }}>
        {rsi.toFixed(0)}
      </span>
      <span style={{ fontSize:8, textAlign:"center", color: macdBias==="bull"?"#4ade80":macdBias==="bear"?"#f87171":"#64748b",
        background:"#0f172a", padding:"1px 5px", borderRadius:3, letterSpacing:"0.05em" }}>
        {macdBias.toUpperCase()}
      </span>
      <span style={{ fontSize:8, textAlign:"center", color: emaBias==="bull"?"#4ade80":emaBias==="bear"?"#f87171":"#64748b",
        background:"#0f172a", padding:"1px 5px", borderRadius:3, letterSpacing:"0.05em" }}>
        {emaBias.toUpperCase()}
      </span>
    </div>
  );
}

/* ── Factor row ────────────────────────────────────────────────── */
function FactorRow({ name, value, bias, weight }: {
  name: string; value: string; bias: string; weight: number;
}) {
  const color = bias==="bull"?"#4ade80":bias==="bear"?"#f87171":"#94a3b8";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"3px 0" }}>
      <span style={{ fontSize:9, color:"#475569", width:90, flexShrink:0 }}>{name}</span>
      <div style={{ flex:1, height:3, background:"#0f172a", borderRadius:2 }}>
        <div style={{ width:`${weight}%`, height:"100%", background:`${color}60`, borderRadius:2 }} />
      </div>
      <span style={{ fontSize:9, fontFamily:"mono", color, width:50, textAlign:"right" }}>{value}</span>
    </div>
  );
}

/* ── Main Widget ───────────────────────────────────────────────── */
export default function ConsensusEngine({ compact = false }: { compact?: boolean }) {
  const history = useMarketStore(s => s.history);
  const [result, setResult] = useState<ConsensusOutput | null>(null);
  const [pulse, setPulse] = useState(false);
  const prevScoreRef = useRef<number>(0);

  useEffect(() => {
    if (!history.length) return;
    const tfBars = simulateTFBars(history);
    const res = computeConsensus(tfBars);
    if (res.score !== prevScoreRef.current) {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
      prevScoreRef.current = res.score;
    }
    setResult(res);
  }, [history]);

  if (!result) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:160,
        color:"#1e40af", fontSize:11, letterSpacing:"0.15em" }}>
        LOADING CONSENSUS…
      </div>
    );
  }

  const cfg = SIGNAL_CFG[result.signal];
  const volColor = result.volatilityState === "extreme" ? "#ff3b6b"
    : result.volatilityState === "elevated" ? "#fb923c"
    : result.volatilityState === "normal"   ? "#60a5fa"
    : "#4ade80";

  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:10,
      padding: compact ? "8px 10px" : "12px 14px",
      background:"linear-gradient(135deg,#060d1f 0%,#0a1628 60%,#060d1f 100%)",
      border:`1px solid ${cfg.color}30`,
      borderRadius:8,
      boxShadow: pulse ? cfg.glow : "none",
      transition:"box-shadow 0.4s ease",
      fontFamily:"'JetBrains Mono','Fira Mono',monospace",
    }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:cfg.color,
            boxShadow:cfg.glow, animation:"pulse 2s infinite" }} />
          <span style={{ fontSize:9, color:"#475569", letterSpacing:"0.15em" }}>CONSENSUS ENGINE</span>
        </div>
        <span style={{ fontSize:8, color:"#1e3a5f" }}>
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Master Signal */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 12px", background:"#060d1f", borderRadius:6,
        border:`1px solid ${cfg.color}25`,
      }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:cfg.color,
            textShadow:cfg.glow, letterSpacing:"0.1em" }}>
            {signalIcon(result.signal)} {cfg.label}
          </div>
          <div style={{ fontSize:9, color:"#475569", marginTop:2 }}>
            SCORE: <span style={{ color:"#94a3b8" }}>{result.score > 0 ? "+" : ""}{result.score}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:14 }}>
          <ArcGauge value={result.confidence}    color={cfg.color}  label="CONFIDENCE" size={72} />
          <ArcGauge value={result.trendStrength} color="#60a5fa"    label="TREND STR"  size={72} />
        </div>
      </div>

      {/* Volatility + Momentum strip */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
        {[
          { label:"VOLATILITY", value:result.volatilityState.toUpperCase(), color:volColor },
          { label:"MOMENTUM",   value:(result.momentumRating > 0 ? "+" : "") + result.momentumRating, color: result.momentumRating > 0 ? "#4ade80" : result.momentumRating < 0 ? "#f87171" : "#94a3b8" },
          { label:"TF AGREE",   value:`${result.timeframes.filter(t=>t.score > 15).length}/${result.timeframes.length}`, color:"#a78bfa" },
        ].map(k => (
          <div key={k.label} style={{ padding:"5px 8px", background:"#0a1628",
            borderRadius:4, border:"1px solid #1e293b" }}>
            <div style={{ fontSize:8, color:"#475569", marginBottom:2 }}>{k.label}</div>
            <div style={{ fontSize:12, fontWeight:800, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* TF Matrix */}
      <div>
        <div style={{ display:"grid", gridTemplateColumns:"36px 90px 1fr 42px 56px 56px",
          gap:6, padding:"2px 8px", marginBottom:4 }}>
          {["TF","SIGNAL","SCORE","RSI","MACD","EMA"].map(h => (
            <span key={h} style={{ fontSize:8, color:"#334155", letterSpacing:"0.08em" }}>{h}</span>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {TF_LABELS.map(tf => {
            const r = result.timeframes.find(x => x.tf === tf);
            if (!r) return (
              <div key={tf} style={{ padding:"5px 8px", borderRadius:4, background:"#0a1628",
                border:"1px solid #1e293b", fontSize:9, color:"#1e3a5f" }}>
                {tf} — awaiting data
              </div>
            );
            return <TFRow key={tf} {...r} />;
          })}
        </div>
      </div>

      {/* Factor breakdown */}
      {!compact && (
        <div style={{ borderTop:"1px solid #1e293b", paddingTop:8 }}>
          <div style={{ fontSize:8, color:"#334155", letterSpacing:"0.12em", marginBottom:6 }}>FACTOR BREAKDOWN</div>
          {result.factors.map(f => <FactorRow key={f.name} {...f} />)}
        </div>
      )}
    </div>
  );
}
