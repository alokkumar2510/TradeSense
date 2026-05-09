"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReplayPlayer = dynamic(() => import("@/components/ReplayPlayer"), { ssr: false,
  loading: () => <Loader text="LOADING REPLAY ENGINE…" />,
});
const BacktestDashboard = dynamic(() => import("@/components/BacktestDashboard"), { ssr: false,
  loading: () => <Loader text="LOADING BACKTEST ENGINE…" />,
});

function Loader({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#3d8eff", fontSize: 11, letterSpacing: "0.15em", fontFamily: "'JetBrains Mono',monospace" }}>
      {text}
    </div>
  );
}

const TABS = [
  { id: "replay",   label: "⏮ REPLAY" },
  { id: "backtest", label: "📊 BACKTEST" },
] as const;
type Tab = typeof TABS[number]["id"];

const C = {
  bg: "#060d1f", border: "#1e293b", accent: "#3d8eff",
  text: "#94a3b8", panel: "#0d1f38", mono: "'JetBrains Mono',monospace",
};

export default function ReplayPage() {
  const [tab, setTab] = useState<Tab>("replay");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 20px", fontFamily: C.mono, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.12em", background: "none", cursor: "pointer",
            border: "none", borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
            color: tab === t.id ? C.accent : C.text,
          }}>{t.label}</button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {tab === "replay"   && <ReplayPlayer />}
        {tab === "backtest" && <BacktestDashboard />}
      </div>
    </div>
  );
}
