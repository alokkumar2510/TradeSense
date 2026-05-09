"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMarketStore } from "@/store/marketStore";
import {
  generateNarrative, narratorFingerprint,
  type NarrativeBlock,
} from "@/lib/narratorEngine";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  RefreshCw, ChevronDown, ChevronUp, Clock,
} from "lucide-react";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#060d1f", surface: "#090f1e", panel: "#0a1628",
  card: "#0d1f38", border: "#1a2d4a", accent: "#3d8eff",
  green: "#00ff88", red: "#ff3b6b", amber: "#fb923c",
  yellow: "#fbbf24", text: "#94a3b8", hi: "#e2e8f0",
  mono: "'JetBrains Mono','Fira Mono',monospace",
};

// ─── Sentiment config ─────────────────────────────────────────────────────────
const SENT = {
  BULLISH:  { color: C.green,  icon: TrendingUp,    label: "BULLISH"  },
  BEARISH:  { color: C.red,    icon: TrendingDown,  label: "BEARISH"  },
  NEUTRAL:  { color: C.text,   icon: Minus,         label: "NEUTRAL"  },
  CAUTION:  { color: C.amber,  icon: AlertTriangle, label: "CAUTION"  },
} as const;

const CAT_COLORS: Record<NarrativeBlock["category"], string> = {
  TREND:      "#3d8eff",
  MOMENTUM:   "#9b7fff",
  VOLATILITY: "#fb923c",
  VOLUME:     "#00d4cc",
  STRUCTURE:  "#fbbf24",
  RISK:       "#ff3b6b",
  SUMMARY:    "#00ff88",
};

// ─── Confidence bar ───────────────────────────────────────────────────────────
function ConfBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 3, background: `${color}20`, borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ─── Single narrative card ────────────────────────────────────────────────────
function NarrBlock({ block, isNew }: { block: NarrativeBlock; isNew: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const cfg  = SENT[block.sentiment];
  const Icon = cfg.icon;
  const catColor = CAT_COLORS[block.category];

  return (
    <div
      style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
        overflow: "hidden",
        animation: isNew ? "narratorFadeIn 0.35s ease" : undefined,
        borderLeft: `3px solid ${catColor}`,
      }}
    >
      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.15em", color: catColor, background: `${catColor}15`, padding: "2px 6px", borderRadius: 3, flexShrink: 0 }}>
          {block.category}
        </span>
        <Icon size={11} color={cfg.color} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: C.hi, fontFamily: C.mono, lineHeight: 1.3 }}>
          {block.headline}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
          {block.confidence}%
        </span>
        {expanded ? <ChevronUp size={11} color={C.text} /> : <ChevronDown size={11} color={C.text} />}
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: "0 12px 10px" }}>
          <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.65, color: "#b8c7d9", fontFamily: "Inter,system-ui,sans-serif" }}>
            {block.body}
          </p>
          <ConfBar pct={block.confidence} color={cfg.color} />
          <div style={{ marginTop: 4, fontSize: 8, color: C.text }}>
            <Clock size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
            {new Date(block.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Timeline entry (historical log) ─────────────────────────────────────────
function TimelineEntry({ block }: { block: NarrativeBlock }) {
  const cfg = SENT[block.sentiment];
  const Icon = cfg.icon;
  return (
    <div style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: `1px solid ${C.border}20` }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <Icon size={11} color={cfg.color} />
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: cfg.color }}>{block.category}</span>
        {" "}
        <span style={{ fontSize: 9, color: C.text }}>
          {new Date(block.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <p style={{ margin: "2px 0 0", fontSize: 9, color: C.text, lineHeight: 1.5 }}>
          {block.body.slice(0, 120)}{block.body.length > 120 ? "…" : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Sentiment gauge ──────────────────────────────────────────────────────────
function SentimentGauge({ blocks }: { blocks: NarrativeBlock[] }) {
  const counts = { BULLISH: 0, BEARISH: 0, NEUTRAL: 0, CAUTION: 0 };
  for (const b of blocks) counts[b.sentiment]++;
  const total = blocks.length || 1;

  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
      {(["BULLISH", "BEARISH", "NEUTRAL", "CAUTION"] as const).map(s => {
        const pct = (counts[s] / total) * 100;
        const cfg = SENT[s];
        return (
          <div key={s} style={{ flex: pct, background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`, borderRadius: 4, padding: "4px 6px", minWidth: pct > 0 ? 40 : 0, transition: "flex 0.4s ease", overflow: "hidden" }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: cfg.color, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{s}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: cfg.color, fontFamily: C.mono }}>{counts[s]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type View = "live" | "timeline";

export default function MarketNarrator({ compact = false }: { compact?: boolean }) {
  const bars   = useMarketStore(s => s.history);
  const symbol = useMarketStore(s => s.symbol);
  const quote  = useMarketStore(s => s.quote);

  const [blocks,    setBlocks]    = useState<NarrativeBlock[]>([]);
  const [timeline,  setTimeline]  = useState<NarrativeBlock[]>([]);
  const [newIds,    setNewIds]    = useState<Set<string>>(new Set());
  const [view,      setView]      = useState<View>("live");
  const [running,   setRunning]   = useState(true);
  const fpRef = useRef("");

  const refresh = useCallback(() => {
    const ltp      = quote?.price ?? 0;
    const change1d = quote?.changePercent ?? 0;
    if (bars.length < 30 || !ltp) return;

    const fp = narratorFingerprint({ bars, symbol, ltp, change1d });
    if (fp === fpRef.current) return;
    fpRef.current = fp;

    const next = generateNarrative({ bars, symbol, ltp, change1d });
    if (!next.length) return;

    const fresh = new Set(next.map(b => b.id));
    setNewIds(fresh);
    setTimeout(() => setNewIds(new Set()), 1000);

    setBlocks(next);
    setTimeline(prev => {
      // Archive the summary block from current generation
      const summary = next.find(b => b.category === "SUMMARY");
      if (summary) return [{ ...summary, id: `tl-${Date.now()}` }, ...prev].slice(0, 50);
      return prev;
    });
  }, [bars, symbol, quote]);

  // Auto-refresh every 15 s when data changes
  useEffect(() => {
    if (!running) return;
    refresh();
    const iv = setInterval(refresh, 15000);
    return () => clearInterval(iv);
  }, [running, refresh]);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "6px 0", borderRadius: 5, cursor: "pointer",
    fontFamily: C.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
    background: active ? `${C.accent}20` : "transparent",
    border: `1px solid ${active ? C.accent : C.border}`,
    color: active ? C.accent : C.text,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, overflow: "hidden" }}>
      {/* Inject animation */}
      <style>{`@keyframes narratorFadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: C.accent }}>AI NARRATOR</div>
            <div style={{ fontSize: 8, color: C.text, marginTop: 1 }}>RULE-BASED · DETERMINISTIC · REAL-TIME</div>
          </div>
          <div style={{ flex: 1 }} />
          {bars.length > 0 && <span style={{ fontSize: 9, color: C.text, fontFamily: C.mono }}>{symbol}</span>}
          <button
            onClick={() => { setRunning(v => !v); }}
            title={running ? "Pause updates" : "Resume updates"}
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 6px", cursor: "pointer", color: running ? C.green : C.text }}
          >
            <RefreshCw size={11} style={{ animation: running ? "spin 3s linear infinite" : undefined }} />
          </button>
          <button onClick={refresh} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 8px", cursor: "pointer", color: C.accent, fontSize: 9, fontFamily: C.mono }}>
            ↻ NOW
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          <button style={tabBtn(view === "live")}     onClick={() => setView("live")}>▣ LIVE</button>
          <button style={tabBtn(view === "timeline")} onClick={() => setView("timeline")}>⏱ TIMELINE</button>
        </div>
      </div>

      {/* Sentiment gauge (live view only) */}
      {view === "live" && blocks.length > 0 && (
        <div style={{ padding: "8px 14px 0", flexShrink: 0 }}>
          <SentimentGauge blocks={blocks} />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px" }}>
        {bars.length < 30 ? (
          <div style={{ padding: 20, textAlign: "center", color: C.text, fontSize: 10, lineHeight: 1.7 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
            <div>Load a symbol on the Dashboard</div>
            <div style={{ fontSize: 9, marginTop: 4 }}>Need ≥30 bars of price history</div>
          </div>
        ) : view === "live" ? (
          blocks.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: C.text, fontSize: 10 }}>
              Generating commentary…
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {blocks.map(b => <NarrBlock key={b.id} block={b} isNew={newIds.has(b.id)} />)}
            </div>
          )
        ) : (
          /* Timeline view */
          timeline.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: C.text, fontSize: 10 }}>
              Timeline builds as market updates flow in
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {timeline.map(b => <TimelineEntry key={b.id} block={b} />)}
            </div>
          )
        )}
      </div>

      {/* Footer */}
      {blocks.length > 0 && (
        <div style={{ padding: "6px 14px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 8, color: C.text }}>Updates every 15s on price change</span>
          <span style={{ fontSize: 8, color: C.text, fontFamily: C.mono }}>
            {blocks.length} signals · {timeline.length} logged
          </span>
        </div>
      )}
    </div>
  );
}
