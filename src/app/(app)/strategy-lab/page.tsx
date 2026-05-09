"use client";
import dynamic from "next/dynamic";

const StrategyBuilder = dynamic(() => import("@/components/StrategyBuilder"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", color: "#1e40af", fontSize: 11, letterSpacing: "0.15em",
      fontFamily: "'JetBrains Mono',monospace",
    }}>
      LOADING STRATEGY LAB…
    </div>
  ),
});

export default function StrategyLabPage() {
  return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <StrategyBuilder />
    </div>
  );
}
