"use client";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMarketStore } from "@/store/marketStore";
import {
  newStrategy, newCondition, newGroup,
  INDICATORS, OPERATORS, TIMEFRAMES,
  type Strategy, type Condition, type ConditionGroup,
  type Indicator, type Operator, type Timeframe, type Logic,
} from "@/lib/strategySchema";
import { validateStrategy } from "@/lib/strategyParser";
import {
  listStrategies, saveStrategy, deleteStrategy, duplicateStrategy,
} from "@/lib/firestore/strategies";
import { toast } from "@/lib/toast";
import { Plus, Trash2, Copy, ChevronRight, Save, Play, Pause, Layers } from "lucide-react";

/* ── Tokens ─────────────────────────────────────────────────────── */
const C = {
  bg:      "#060d1f",
  surface: "#0a1628",
  panel:   "#0d1f38",
  border:  "#1e293b",
  accent:  "#3d8eff",
  green:   "#00ff88",
  red:     "#ff3b6b",
  amber:   "#fb923c",
  text:    "#94a3b8",
  textHi:  "#e2e8f0",
  mono:    "'JetBrains Mono','Fira Mono',monospace",
};

const inputStyle: React.CSSProperties = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4,
  color: C.textHi, fontFamily: C.mono, fontSize: 11, padding: "3px 7px",
  outline: "none",
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function isGroup(item: Condition | ConditionGroup): item is ConditionGroup {
  return "conditions" in item;
}

function isNumeric(s: string) { return !isNaN(Number(s)); }

/* ── ConditionRow ────────────────────────────────────────────────── */
function ConditionRow({
  cond, onChange, onRemove,
}: {
  cond: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
}) {
  const rightIsNum = typeof cond.right === "number";
  const rightStr   = rightIsNum ? String(cond.right) : cond.right as string;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "7px 10px", borderRadius: 6,
      background: C.surface, border: `1px solid ${C.border}`,
      flexWrap: "wrap",
    }}>
      {/* Left indicator */}
      <select
        value={cond.left}
        onChange={e => onChange({ ...cond, left: e.target.value as Indicator })}
        style={inputStyle}
      >
        {INDICATORS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
      </select>

      {/* Operator */}
      <select
        value={cond.operator}
        onChange={e => onChange({ ...cond, operator: e.target.value as Operator })}
        style={inputStyle}
      >
        {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Right: toggle between number and indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => onChange({
            ...cond,
            right: rightIsNum ? ("Price" as Indicator) : 0,
          })}
          style={{
            fontSize: 9, padding: "2px 6px", borderRadius: 3,
            background: rightIsNum ? C.accent + "30" : C.panel,
            border: `1px solid ${rightIsNum ? C.accent : C.border}`,
            color: rightIsNum ? C.accent : C.text,
            cursor: "pointer", fontFamily: C.mono, letterSpacing: "0.06em",
          }}
        >{rightIsNum ? "VALUE" : "INDICATOR"}</button>

        {rightIsNum ? (
          <input
            type="number"
            value={rightStr}
            onChange={e => onChange({ ...cond, right: parseFloat(e.target.value) || 0 })}
            style={{ ...inputStyle, width: 64 }}
          />
        ) : (
          <select
            value={rightStr}
            onChange={e => onChange({
              ...cond,
              right: isNumeric(e.target.value) ? parseFloat(e.target.value) : e.target.value as Indicator,
            })}
            style={inputStyle}
          >
            {INDICATORS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        )}
      </div>

      {/* Timeframe */}
      <select
        value={cond.timeframe}
        onChange={e => onChange({ ...cond, timeframe: e.target.value as Timeframe })}
        style={inputStyle}
      >
        {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
      </select>

      {/* Remove */}
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.red, padding: 3, marginLeft: "auto",
      }}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}

/* ── ConditionGroupEditor ────────────────────────────────────────── */
function GroupEditor({
  group, onChange, onRemove, depth = 0,
}: {
  group: ConditionGroup;
  onChange: (g: ConditionGroup) => void;
  onRemove?: () => void;
  depth?: number;
}) {
  const updateItem = (idx: number, item: Condition | ConditionGroup) => {
    const conditions = [...group.conditions];
    conditions[idx] = item;
    onChange({ ...group, conditions });
  };

  const removeItem = (idx: number) => {
    const conditions = group.conditions.filter((_, i) => i !== idx);
    onChange({ ...group, conditions });
  };

  const addCondition = () => onChange({
    ...group,
    conditions: [...group.conditions, newCondition()],
  });

  const addSubgroup = () => onChange({
    ...group,
    conditions: [...group.conditions, newGroup("OR")],
  });

  const toggleLogic = () => onChange({
    ...group,
    logic: group.logic === "AND" ? "OR" : "AND",
  });

  const logicColor = group.logic === "AND" ? C.green : C.amber;

  return (
    <div style={{
      borderLeft: depth > 0 ? `2px solid ${logicColor}30` : "none",
      marginLeft: depth > 0 ? 12 : 0,
      paddingLeft: depth > 0 ? 12 : 0,
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      {/* Logic toggle bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={toggleLogic} style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
          padding: "2px 10px", borderRadius: 4,
          background: `${logicColor}18`,
          border: `1px solid ${logicColor}50`,
          color: logicColor, cursor: "pointer", fontFamily: C.mono,
        }}>{group.logic}</button>
        <span style={{ fontSize: 9, color: C.text }}>
          {group.logic === "AND" ? "All conditions must match" : "Any condition must match"}
        </span>
        {onRemove && (
          <button onClick={onRemove} style={{
            marginLeft: "auto", background: "none", border: "none",
            cursor: "pointer", color: C.red, padding: 2,
          }}><Trash2 size={11} /></button>
        )}
      </div>

      {/* Conditions */}
      {group.conditions.map((item, idx) => (
        <div key={isGroup(item) ? item.id : (item as Condition).id}>
          {isGroup(item) ? (
            <GroupEditor
              group={item}
              onChange={g => updateItem(idx, g)}
              onRemove={() => removeItem(idx)}
              depth={depth + 1}
            />
          ) : (
            <ConditionRow
              cond={item as Condition}
              onChange={c => updateItem(idx, c)}
              onRemove={() => removeItem(idx)}
            />
          )}
        </div>
      ))}

      {/* Add buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={addCondition} style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 9, padding: "4px 10px", borderRadius: 4,
          background: C.panel, border: `1px solid ${C.border}`,
          color: C.text, cursor: "pointer", fontFamily: C.mono,
        }}>
          <Plus size={10} /> Condition
        </button>
        {depth < 2 && (
          <button onClick={addSubgroup} style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 9, padding: "4px 10px", borderRadius: 4,
            background: C.panel, border: `1px solid ${C.border}`,
            color: C.text, cursor: "pointer", fontFamily: C.mono,
          }}>
            <Layers size={10} /> Sub-Group
          </button>
        )}
      </div>
    </div>
  );
}

/* ── RiskPanel ───────────────────────────────────────────────────── */
function RiskPanel({ risk, onChange }: {
  risk: Strategy["risk"];
  onChange: (r: Strategy["risk"]) => void;
}) {
  const fields = [
    { key: "stopLoss",     label: "Stop Loss %",      icon: "🛑", nullable: true },
    { key: "takeProfit",   label: "Take Profit %",    icon: "🎯", nullable: true },
    { key: "trailingStop", label: "Trailing Stop %",  icon: "📉", nullable: true },
    { key: "positionSize", label: "Position Size %",  icon: "💼", nullable: false },
  ] as const;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {fields.map(f => (
        <div key={f.key} style={{
          padding: "8px 10px", borderRadius: 6,
          background: C.surface, border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 9, color: C.text, marginBottom: 4 }}>
            {f.icon} {f.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="number"
              value={risk[f.key] ?? ""}
              placeholder={f.nullable ? "off" : "5"}
              onChange={e => {
                const v = e.target.value === "" ? null : parseFloat(e.target.value);
                onChange({ ...risk, [f.key]: v });
              }}
              style={{ ...inputStyle, width: 64, flex: 1 }}
            />
            {f.nullable && risk[f.key] !== null && (
              <button onClick={() => onChange({ ...risk, [f.key]: null })} style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.text, fontSize: 9,
              }}>✕</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */
function Section({ title, color, children, badge }: {
  title: string; color: string; children: React.ReactNode; badge?: string;
}) {
  return (
    <div style={{
      borderRadius: 8, border: `1px solid ${color}25`,
      background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
      padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color, fontFamily: C.mono }}>{title}</span>
        {badge && <span style={{ marginLeft: "auto", fontSize: 8, color: C.text,
          padding: "1px 6px", borderRadius: 3, background: C.panel,
          border: `1px solid ${C.border}` }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Main Builder ────────────────────────────────────────────────── */
export default function StrategyBuilder() {
  const { user } = useAuth();
  const symbol = useMarketStore(s => s.symbol);
  const [strategies, setStrategies]   = useState<Strategy[]>([]);
  const [active, setActive]           = useState<Strategy | null>(null);
  const [busy, setBusy]               = useState(false);
  const [validation, setValidation]   = useState<{ valid: boolean; issues: string[] } | null>(null);

  /* load */
  useEffect(() => {
    if (!user) return;
    listStrategies(user.uid).then(setStrategies).catch(() => {});
  }, [user]);

  /* auto-validate on change */
  useEffect(() => {
    if (active) setValidation(validateStrategy(active));
  }, [active]);

  const createNew = () => {
    if (!user) return;
    const s = newStrategy(user.uid);
    s.symbol = symbol || "ANY";
    setActive(s);
  };

  const handleSave = async () => {
    if (!active || !user) return;
    if (!validation?.valid) { toast("Fix validation errors first"); return; }
    setBusy(true);
    try {
      const saved = await saveStrategy({ ...active, updatedAt: Date.now() });
      setStrategies(prev => {
        const idx = prev.findIndex(s => s.id === saved.id);
        return idx >= 0 ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev];
      });
      setActive(saved);
      toast("Strategy saved ✓");
    } catch { toast("Save failed"); }
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this strategy?")) return;
    await deleteStrategy(id);
    setStrategies(prev => prev.filter(s => s.id !== id));
    if (active?.id === id) setActive(null);
    toast("Deleted");
  };

  const handleDuplicate = async (s: Strategy) => {
    if (!user) return;
    const copy = await duplicateStrategy(s, user.uid);
    setStrategies(prev => [copy, ...prev]);
    toast("Duplicated");
  };

  return (
    <div style={{
      display: "flex", height: "100%", background: C.bg,
      fontFamily: C.mono, color: C.text, overflow: "hidden",
    }}>
      {/* ── LEFT: Strategy List ── */}
      <div style={{
        width: 220, flexShrink: 0, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: C.textHi }}>
            STRATEGIES
          </span>
          <button onClick={createNew} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
            borderRadius: 4, background: `${C.accent}20`,
            border: `1px solid ${C.accent}50`, color: C.accent,
            fontSize: 9, cursor: "pointer",
          }}>
            <Plus size={10} /> New
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {strategies.length === 0 && (
            <div style={{ padding: 16, fontSize: 10, color: C.text, textAlign: "center", lineHeight: 1.6 }}>
              No strategies yet.<br />Create one to start.
            </div>
          )}
          {strategies.map(s => (
            <div key={s.id}
              onClick={() => setActive(s)}
              style={{
                padding: "9px 12px", cursor: "pointer",
                borderBottom: `1px solid ${C.border}`,
                background: active?.id === s.id ? `${C.accent}12` : "transparent",
                borderLeft: `2px solid ${active?.id === s.id ? C.accent : "transparent"}`,
                transition: "background 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: s.active ? C.green : C.border,
                }} />
                <span style={{ fontSize: 11, color: C.textHi, flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.name}
                </span>
              </div>
              <div style={{ fontSize: 9, color: C.text, marginTop: 3, paddingLeft: 12 }}>
                {s.symbol} · {s.timeframe}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, paddingLeft: 12 }}>
                <button onClick={e => { e.stopPropagation(); handleDuplicate(s); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: C.text, padding: 2,
                }}><Copy size={10} /></button>
                <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: C.red, padding: 2,
                }}><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Builder ── */}
      {!active ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 12 }}>
          <ChevronRight size={36} color={C.border} />
          <span style={{ fontSize: 11, color: C.text }}>Select or create a strategy</span>
          <button onClick={createNew} style={{
            padding: "8px 20px", borderRadius: 6, fontSize: 11,
            background: `${C.accent}20`, border: `1px solid ${C.accent}60`,
            color: C.accent, cursor: "pointer",
          }}>+ New Strategy</button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              value={active.name}
              onChange={e => setActive({ ...active, name: e.target.value })}
              style={{
                ...inputStyle, flex: 1, fontSize: 14, fontWeight: 700,
                padding: "6px 10px", background: "transparent",
                border: `1px solid ${C.border}`,
              }}
              placeholder="Strategy name…"
            />
            {/* Symbol */}
            <input
              value={active.symbol}
              onChange={e => setActive({ ...active, symbol: e.target.value.toUpperCase() })}
              style={{ ...inputStyle, width: 120 }}
              placeholder="SYMBOL or ANY"
            />
            {/* Active toggle */}
            <button
              onClick={() => setActive({ ...active, active: !active.active })}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 6, fontSize: 10,
                background: active.active ? `${C.green}15` : C.panel,
                border: `1px solid ${active.active ? C.green : C.border}`,
                color: active.active ? C.green : C.text,
                cursor: "pointer",
              }}
            >
              {active.active ? <Play size={10} /> : <Pause size={10} />}
              {active.active ? "ACTIVE" : "PAUSED"}
            </button>
            {/* Save */}
            <button
              onClick={handleSave}
              disabled={busy || !validation?.valid}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 14px", borderRadius: 6, fontSize: 10,
                background: validation?.valid ? `${C.accent}20` : C.panel,
                border: `1px solid ${validation?.valid ? C.accent : C.border}`,
                color: validation?.valid ? C.accent : C.text,
                cursor: validation?.valid ? "pointer" : "not-allowed",
                opacity: busy ? 0.7 : 1,
              }}
            >
              <Save size={10} /> {busy ? "SAVING…" : "SAVE"}
            </button>
          </div>

          {/* Validation */}
          {validation && !validation.valid && (
            <div style={{ padding: "8px 12px", borderRadius: 6,
              background: `${C.red}10`, border: `1px solid ${C.red}30` }}>
              {validation.issues.map((i, x) => (
                <div key={x} style={{ fontSize: 10, color: C.red, lineHeight: 1.8 }}>⚠ {i}</div>
              ))}
            </div>
          )}

          {/* Description */}
          <input
            value={active.description}
            onChange={e => setActive({ ...active, description: e.target.value })}
            style={{ ...inputStyle, width: "100%", padding: "6px 10px" }}
            placeholder="Description (optional)"
          />

          {/* Entry conditions */}
          <Section title="Entry Conditions" color={C.green}
            badge={`${active.entry.conditions.length} rule${active.entry.conditions.length !== 1 ? "s" : ""}`}>
            <GroupEditor
              group={active.entry}
              onChange={g => setActive({ ...active, entry: g })}
            />
          </Section>

          {/* Exit conditions */}
          <Section title="Exit Conditions" color={C.red}
            badge={`${active.exit.conditions.length} rule${active.exit.conditions.length !== 1 ? "s" : ""}`}>
            <GroupEditor
              group={active.exit}
              onChange={g => setActive({ ...active, exit: g })}
            />
          </Section>

          {/* Risk Management */}
          <Section title="Risk Management" color={C.amber}>
            <RiskPanel
              risk={active.risk}
              onChange={r => setActive({ ...active, risk: r })}
            />
          </Section>

        </div>
      )}
    </div>
  );
}
