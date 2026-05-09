"use client";
import dynamic from "next/dynamic";

const PaperTrading = dynamic(() => import("@/components/PaperTrading"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#3d8eff", fontSize: 11, letterSpacing: "0.15em", fontFamily: "'JetBrains Mono',monospace" }}>
      LOADING PAPER ENGINE…
    </div>
  ),
});

export default function PaperTradePage() {
  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      <PaperTrading />
    </div>
  );
}
