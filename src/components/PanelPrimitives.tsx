"use client";
import React from "react";

/* ── Shared panel primitives used by all analytics widgets ── */

export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--bg-panel)",
      border: "1px solid var(--border-dim)",
      borderRadius: "var(--r-md)",
      padding: "0.85rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function PanelHdr({ icon, title, badge }: { icon: string; title: string; badge?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.1rem" }}>
      <span style={{ fontSize: "0.9rem" }}>{icon}</span>
      <span style={{
        fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--text-secondary)",
      }}>{title}</span>
      {badge && (
        <span style={{
          marginLeft: "auto", fontSize: "0.55rem", fontWeight: 800,
          letterSpacing: "0.08em", padding: "1px 6px",
          borderRadius: "var(--r-xs)", background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)", color: "var(--text-muted)",
        }}>{badge}</span>
      )}
    </div>
  );
}

export function SkeletonPanel({ title }: { title: string }) {
  return (
    <Panel>
      <PanelHdr icon="⏳" title={title} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        {[80, 60, 90, 50].map((w, i) => (
          <div key={i} style={{
            height: 10, width: `${w}%`, borderRadius: 4,
            background: "var(--bg-elevated)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        ))}
      </div>
    </Panel>
  );
}

export function EmptyPanel({ icon, title }: { icon: string; title: string }) {
  return (
    <Panel>
      <PanelHdr icon={icon} title={title} />
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "0.4rem",
        padding: "1.5rem 0", color: "var(--text-dim)",
      }}>
        <span style={{ fontSize: "1.6rem", opacity: 0.3 }}>{icon}</span>
        <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em" }}>
          SELECT A SYMBOL
        </span>
      </div>
    </Panel>
  );
}
