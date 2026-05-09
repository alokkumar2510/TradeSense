"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { type LucideIcon, Settings, User, Bell, Shield, Palette, Info, LogOut } from "lucide-react";

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-dim)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border-dim)" }}>
        <Icon size={14} style={{ color: "var(--blue)" }} />
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
      </div>
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        {desc && <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>}
      </div>
      <div
        onClick={onChange}
        style={{
          width: 36, height: 20, borderRadius: 10, flexShrink: 0, cursor: "pointer",
          background: checked ? "var(--blue)" : "var(--bg-elevated)",
          border: `1px solid ${checked ? "var(--blue)" : "var(--border-dim)"}`,
          position: "relative", transition: "all 0.2s ease",
        }}
      >
        <div style={{
          position: "absolute", top: 2, left: checked ? 18 : 2,
          width: 14, height: 14, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [notifPrice,   setNotifPrice]   = useState(true);
  const [notifNews,    setNotifNews]    = useState(false);
  const [notifSignals, setNotifSignals] = useState(true);
  const [darkMode,     setDarkMode]     = useState(true);
  const [compactView,  setCompactView]  = useState(false);
  const [showVolume,   setShowVolume]   = useState(true);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, marginTop: 2 }}>Manage your account and preferences</p>
      </div>

      {/* Account */}
      <Section title="Account" icon={User}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--blue-dim), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", fontWeight: 900, color: "#fff",
          }}>
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>{user?.email?.split("@")[0]}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{user?.email}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "3px 8px", borderRadius: 3, background: "var(--blue-muted)", color: "var(--blue)", border: "1px solid rgba(77,159,255,0.3)" }}>PRO</span>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Toggle label="Price Alerts"   desc="Get notified when price targets are hit"     checked={notifPrice}   onChange={() => setNotifPrice(v => !v)} />
        <Toggle label="News Alerts"    desc="Breaking news for your watchlist"            checked={notifNews}    onChange={() => setNotifNews(v => !v)} />
        <Toggle label="Signal Alerts"  desc="Engine BUY/SELL signals for tracked stocks" checked={notifSignals} onChange={() => setNotifSignals(v => !v)} />
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <Toggle label="Dark Mode"     desc="Terminal dark theme (recommended)"           checked={darkMode}     onChange={() => setDarkMode(v => !v)} />
        <Toggle label="Compact View"  desc="Reduce padding for denser data display"      checked={compactView}  onChange={() => setCompactView(v => !v)} />
        <Toggle label="Show Volume"   desc="Display volume bars on charts"               checked={showVolume}   onChange={() => setShowVolume(v => !v)} />
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security" icon={Shield}>
        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Your data is stored locally and in your Firebase account. TradeSense does not sell or share your personal information with third parties.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["Privacy Policy", "Terms of Service", "Data Export"].map(label => (
            <button key={label} style={{
              fontSize: "0.68rem", fontWeight: 600, padding: "5px 10px",
              background: "var(--bg-elevated)", border: "1px solid var(--border-dim)",
              borderRadius: "var(--r-xs)", color: "var(--text-secondary)", cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>
      </Section>

      {/* App info */}
      <Section title="About" icon={Info}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: "Version",     value: "1.0.0" },
            { label: "Build",       value: "Production" },
            { label: "Data",        value: "Yahoo Finance · Finnhub · FMP · Alpha Vantage" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
              <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
              <span style={{ color: "var(--text-secondary)", fontFamily: r.label === "Version" ? "var(--font-mono)" : "inherit" }}>{r.value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Logout */}
      <button
        onClick={() => logout?.()}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "10px 14px", borderRadius: "var(--r-md)", cursor: "pointer",
          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
          color: "var(--red)", fontSize: "0.78rem", fontWeight: 700, width: "100%",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.15)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
      >
        <LogOut size={14} />
        Sign Out
      </button>
    </div>
  );
}
