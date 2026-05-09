"use client";
import { useState, useEffect, useCallback } from "react";
import { useMarketStore } from "@/store/marketStore";
import { usePaperStore, selectStats } from "@/store/paperStore";
import type { OrderSide, OrderType } from "@/store/paperStore";
import {
  TrendingUp, TrendingDown, Wallet, BarChart2,
  ShoppingCart, X, CheckCircle, AlertTriangle,
  RefreshCw, Clock,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#060d1f", surface: "#090f1e", panel: "#0a1628",
  card: "#0d1f38", border: "#1a2d4a", accent: "#3d8eff",
  green: "#00ff88", red: "#ff3b6b", amber: "#fb923c",
  yellow: "#fbbf24", text: "#94a3b8", hi: "#e2e8f0",
  mono: "'JetBrains Mono','Fira Mono',monospace",
  sans: "Inter,system-ui,sans-serif",
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 8, letterSpacing: "0.14em", color: C.text, textTransform: "uppercase" as const }}>{children}</span>
);

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 100, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
      <Label>{label}</Label>
      <div style={{ fontSize: 16, fontWeight: 800, color: color ?? C.hi, fontFamily: C.mono, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: C.text, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ padding: "2px 7px", borderRadius: 4, background: `${color}18`, border: `1px solid ${color}40`, color, fontSize: 9, fontWeight: 700, fontFamily: C.mono }}>
      {children}
    </span>
  );
}

// ─── Order Form ───────────────────────────────────────────────────────────────
function OrderForm() {
  const symbol = useMarketStore(s => s.symbol);
  const quote  = useMarketStore(s => s.quote);
  const ltp    = quote?.price ?? 0;

  const placeOrder = usePaperStore(s => s.placeOrder);
  const capital    = usePaperStore(s => s.capital);
  const positions  = usePaperStore(s => s.positions);

  const [side, setSide]   = useState<OrderSide>("BUY");
  const [type, setType]   = useState<OrderType>("MARKET");
  const [qty,  setQty]    = useState("10");
  const [limit, setLimit] = useState("");
  const [sl,   setSl]     = useState("");
  const [tp,   setTp]     = useState("");
  const [msg,  setMsg]    = useState<{ ok: boolean; text: string } | null>(null);
  const [riskPct, setRiskPct] = useState("2");

  const pos = positions[symbol];
  const fillPx  = type === "MARKET" ? ltp : parseFloat(limit || "0") || ltp;
  const totalCost = fillPx * parseInt(qty || "0", 10);
  const numQty    = parseInt(qty || "0", 10);

  // Risk-based qty suggestion
  const suggestQty = useCallback(() => {
    if (!ltp || !sl) return;
    const riskAmt = capital * (parseFloat(riskPct) / 100);
    const riskPerShare = Math.abs(ltp - parseFloat(sl));
    if (riskPerShare > 0) setQty(String(Math.max(1, Math.floor(riskAmt / riskPerShare))));
  }, [capital, ltp, riskPct, sl]);

  const submit = () => {
    if (!symbol || !ltp) { setMsg({ ok: false, text: "No symbol loaded" }); return; }
    const id = placeOrder({
      symbol, side, type, qty: numQty,
      price: ltp,
      limitPrice: type === "LIMIT" ? parseFloat(limit) || undefined : undefined,
      sl: sl ? parseFloat(sl) : undefined,
      tp: tp ? parseFloat(tp) : undefined,
    });
    if (id) {
      setMsg({ ok: true, text: `${side} ${numQty} × ${symbol} @ ₹${fillPx.toFixed(2)} — #${id}` });
    } else {
      setMsg({ ok: false, text: "Order rejected — check qty / capital" });
    }
    setTimeout(() => setMsg(null), 4000);
  };

  const inputStyle: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
    color: C.hi, fontFamily: C.mono, fontSize: 11, padding: "6px 10px", width: "100%",
    outline: "none",
  };
  const tabBtn = (active: boolean, color = C.accent): React.CSSProperties => ({
    flex: 1, padding: "6px 0", borderRadius: 6, cursor: "pointer", fontWeight: 700,
    fontSize: 11, fontFamily: C.mono, letterSpacing: "0.08em",
    background: active ? `${color}22` : "transparent",
    border: `1px solid ${active ? color : C.border}`,
    color: active ? color : C.text, transition: "all 0.15s",
  });

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: C.accent }}>ORDER ENTRY</div>

      {/* Symbol info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.hi }}>{symbol || "—"}</span>
        <span style={{ fontFamily: C.mono, fontSize: 14, fontWeight: 700, color: ltp > 0 ? C.green : C.text }}>
          ₹{ltp.toFixed(2)}
        </span>
      </div>

      {/* BUY / SELL */}
      <div style={{ display: "flex", gap: 6 }}>
        <button style={tabBtn(side === "BUY", C.green)} onClick={() => setSide("BUY")}>▲ BUY</button>
        <button style={tabBtn(side === "SELL", C.red)}  onClick={() => setSide("SELL")}>▼ SELL</button>
      </div>

      {/* MARKET / LIMIT */}
      <div style={{ display: "flex", gap: 6 }}>
        <button style={tabBtn(type === "MARKET")} onClick={() => setType("MARKET")}>MARKET</button>
        <button style={tabBtn(type === "LIMIT")}  onClick={() => setType("LIMIT")}>LIMIT</button>
      </div>

      {/* Qty */}
      <div>
        <Label>Quantity</Label>
        <input style={{ ...inputStyle, marginTop: 4 }} value={qty} onChange={e => setQty(e.target.value)} type="number" min="1" />
      </div>

      {/* Limit price */}
      {type === "LIMIT" && (
        <div>
          <Label>Limit Price</Label>
          <input style={{ ...inputStyle, marginTop: 4 }} value={limit} onChange={e => setLimit(e.target.value)} placeholder={ltp.toFixed(2)} type="number" />
        </div>
      )}

      {/* SL / TP */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <Label>Stop Loss</Label>
          <input style={{ ...inputStyle, marginTop: 4 }} value={sl} onChange={e => setSl(e.target.value)} placeholder="optional" type="number" />
        </div>
        <div style={{ flex: 1 }}>
          <Label>Take Profit</Label>
          <input style={{ ...inputStyle, marginTop: 4 }} value={tp} onChange={e => setTp(e.target.value)} placeholder="optional" type="number" />
        </div>
      </div>

      {/* Risk sizer */}
      {side === "BUY" && (
        <div style={{ background: C.surface, borderRadius: 6, padding: 10, border: `1px solid ${C.border}` }}>
          <Label>Risk Sizer — risk {riskPct}% of capital</Label>
          <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
            <input style={{ ...inputStyle, width: 60 }} value={riskPct} onChange={e => setRiskPct(e.target.value)} type="number" min="0.5" max="10" step="0.5" />
            <button onClick={suggestQty} style={{ ...tabBtn(false, C.amber), flex: 1, fontSize: 9 }}>SUGGEST QTY</button>
          </div>
          <div style={{ fontSize: 9, color: C.text, marginTop: 4 }}>Risk ₹{(capital * parseFloat(riskPct || "0") / 100).toFixed(0)} | Requires SL set</div>
        </div>
      )}

      {/* Order summary */}
      <div style={{ background: C.surface, borderRadius: 6, padding: 10, fontSize: 10, color: C.text, fontFamily: C.mono }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Est. Value</span>
          <span style={{ color: C.hi }}>₹{totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          <span>Available</span>
          <span style={{ color: capital >= totalCost ? C.green : C.red }}>₹{capital.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
        </div>
        {pos && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span>Current Pos</span>
            <span style={{ color: C.amber }}>{pos.qty} × ₹{pos.avgPrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={!ltp || numQty <= 0}
        style={{
          padding: "10px 0", borderRadius: 8, cursor: "pointer", fontFamily: C.mono,
          fontWeight: 800, fontSize: 12, letterSpacing: "0.1em",
          background: side === "BUY" ? `${C.green}22` : `${C.red}22`,
          border: `1px solid ${side === "BUY" ? C.green : C.red}`,
          color: side === "BUY" ? C.green : C.red,
          opacity: !ltp || numQty <= 0 ? 0.4 : 1,
        }}
      >
        {side === "BUY" ? "▲ BUY" : "▼ SELL"} {numQty} × {symbol}
      </button>

      {/* Feedback */}
      {msg && (
        <div style={{
          padding: "8px 12px", borderRadius: 6, fontSize: 10, fontFamily: C.mono,
          background: msg.ok ? `${C.green}10` : `${C.red}10`,
          border: `1px solid ${msg.ok ? C.green : C.red}50`,
          color: msg.ok ? C.green : C.red,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {msg.ok ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
          {msg.text}
        </div>
      )}
    </div>
  );
}

// ─── Position Cards ───────────────────────────────────────────────────────────
function PositionCards() {
  const positions  = usePaperStore(s => s.positions);
  const placeOrder = usePaperStore(s => s.placeOrder);
  const quote      = useMarketStore(s => s.quote);
  const symbol     = useMarketStore(s => s.symbol);

  const entries = Object.values(positions);
  if (!entries.length) return (
    <div style={{ padding: 20, textAlign: "center", color: C.text, fontSize: 10 }}>No open positions</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map(p => (
        <div key={p.symbol} style={{ background: C.card, border: `1px solid ${p.unrealPnl >= 0 ? C.green : C.red}30`, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.hi }}>{p.symbol}</span>
              <span style={{ marginLeft: 8, fontSize: 9 }}><Badge color={C.green}>LONG</Badge></span>
            </div>
            <button
              onClick={() => placeOrder({ symbol: p.symbol, side: "SELL", type: "MARKET", qty: p.qty, price: p.ltp })}
              style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, color: C.red, borderRadius: 5, fontSize: 9, padding: "3px 8px", cursor: "pointer", fontWeight: 700, fontFamily: C.mono }}
            >
              CLOSE
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 8, fontSize: 10, fontFamily: C.mono }}>
            <div><div style={{ color: C.text, fontSize: 8 }}>QTY</div><div style={{ color: C.hi }}>{p.qty}</div></div>
            <div><div style={{ color: C.text, fontSize: 8 }}>AVG</div><div style={{ color: C.hi }}>₹{p.avgPrice.toFixed(2)}</div></div>
            <div><div style={{ color: C.text, fontSize: 8 }}>LTP</div><div style={{ color: C.hi }}>₹{p.ltp.toFixed(2)}</div></div>
            <div>
              <div style={{ color: C.text, fontSize: 8 }}>P&L</div>
              <div style={{ color: p.unrealPnl >= 0 ? C.green : C.red, fontWeight: 700 }}>
                {p.unrealPnl >= 0 ? "+" : ""}₹{p.unrealPnl.toFixed(0)} ({p.pnlPct.toFixed(2)}%)
              </div>
            </div>
          </div>
          {(p.sl || p.tp) && (
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {p.sl && <span style={{ fontSize: 9, color: C.red, fontFamily: C.mono }}>SL ₹{p.sl}</span>}
              {p.tp && <span style={{ fontSize: 9, color: C.green, fontFamily: C.mono }}>TP ₹{p.tp}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Order History ────────────────────────────────────────────────────────────
function OrderHistory() {
  const orders = usePaperStore(s => s.orders);
  if (!orders.length) return (
    <div style={{ padding: 20, textAlign: "center", color: C.text, fontSize: 10 }}>No orders yet</div>
  );

  const statusColor = (st: string) =>
    st === "FILLED" ? C.green : st === "CANCELLED" ? C.text : st === "PENDING" ? C.amber : C.red;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, fontFamily: C.mono }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["ID","Symbol","Side","Type","Qty","Price","P&L","Status","Time"].map(h => (
              <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: C.text, fontSize: 8, letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 50).map(o => (
            <tr key={o.id} style={{ borderBottom: `1px solid ${C.border}20` }}>
              <td style={{ padding: "5px 10px", color: C.text }}>{o.id}</td>
              <td style={{ padding: "5px 10px", color: C.hi, fontWeight: 700 }}>{o.symbol}</td>
              <td style={{ padding: "5px 10px" }}>
                <Badge color={o.side === "BUY" ? C.green : C.red}>{o.side}</Badge>
              </td>
              <td style={{ padding: "5px 10px", color: C.text }}>{o.type}</td>
              <td style={{ padding: "5px 10px", color: C.hi }}>{o.qty}</td>
              <td style={{ padding: "5px 10px", color: C.hi }}>₹{o.price.toFixed(2)}</td>
              <td style={{ padding: "5px 10px", color: o.pnl != null ? o.pnl >= 0 ? C.green : C.red : C.text }}>
                {o.pnl != null ? `${o.pnl >= 0 ? "+" : ""}₹${o.pnl.toFixed(0)}` : "—"}
              </td>
              <td style={{ padding: "5px 10px" }}>
                <Badge color={statusColor(o.status)}>{o.status}</Badge>
              </td>
              <td style={{ padding: "5px 10px", color: C.text }}>
                {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Equity Sparkline ─────────────────────────────────────────────────────────
function EquitySparkline() {
  const equity = usePaperStore(s => s.equity);
  if (equity.length < 2) return null;

  const vals  = equity.map(e => e.equity);
  const min   = Math.min(...vals);
  const max   = Math.max(...vals);
  const range = max - min || 1;
  const W = 200, H = 40;

  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(" ");

  const lastUp = vals[vals.length - 1] >= vals[0];

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={lastUp ? C.green : C.red} strokeWidth={1.5} />
    </svg>
  );
}

// ─── Main PaperTrading component ──────────────────────────────────────────────
type Tab = "positions" | "orders";

export default function PaperTrading() {
  const symbol  = useMarketStore(s => s.symbol);
  const quote   = useMarketStore(s => s.quote);
  const tickPrice = usePaperStore(s => s.tickPrice);
  const reset     = usePaperStore(s => s.reset);
  const setCapital = usePaperStore(s => s.setCapital);
  const stats   = usePaperStore(selectStats);
  const [tab, setTab] = useState<Tab>("positions");
  const [showReset, setShowReset] = useState(false);
  const [newCap, setNewCap] = useState("500000");

  // Tick live price into the paper engine whenever quote updates
  useEffect(() => {
    if (symbol && quote?.price) tickPrice(symbol, quote.price);
  }, [symbol, quote?.price, tickPrice]);

  const pnlColor = stats.totalPnl >= 0 ? C.green : C.red;

  return (
    <div style={{ display: "flex", height: "100%", background: C.bg, overflow: "hidden", fontFamily: C.sans }}>

      {/* ── Left: Order Entry ── */}
      <div style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: 14 }}>
        <OrderForm />

        {/* Capital settings */}
        <div style={{ marginTop: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.accent }}>ACCOUNT</span>
            <button onClick={() => setShowReset(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: C.text }}>
              <RefreshCw size={12} />
            </button>
          </div>
          {showReset && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>Set Starting Capital</Label>
              <input
                value={newCap} onChange={e => setNewCap(e.target.value)} type="number"
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.hi, fontFamily: C.mono, fontSize: 11, padding: "5px 10px", outline: "none" }}
              />
              <button
                onClick={() => { setCapital(parseFloat(newCap)); setShowReset(false); }}
                style={{ padding: "5px", borderRadius: 6, background: `${C.accent}20`, border: `1px solid ${C.accent}`, color: C.accent, fontSize: 10, fontFamily: C.mono, cursor: "pointer", fontWeight: 700 }}
              >
                RESET & APPLY
              </button>
              <button onClick={reset} style={{ padding: "5px", borderRadius: 6, background: `${C.red}10`, border: `1px solid ${C.red}40`, color: C.red, fontSize: 10, fontFamily: C.mono, cursor: "pointer", fontWeight: 700 }}>
                FULL RESET
              </button>
            </div>
          )}
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, fontFamily: C.mono, fontSize: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.text }}>Cash</span>
              <span style={{ color: C.hi }}>₹{stats.availableCash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.text }}>Positions</span>
              <span style={{ color: C.hi }}>₹{stats.positionValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.border}`, paddingTop: 4, marginTop: 2 }}>
              <span style={{ color: C.text }}>Net Equity</span>
              <span style={{ color: C.accent, fontWeight: 800 }}>₹{stats.netEquity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Dashboard ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Analytics header ── */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: C.accent, marginBottom: 10 }}>
            PAPER TRADING — PERFORMANCE ANALYTICS
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <MetricCard label="Net Equity" value={`₹${(stats.netEquity / 1000).toFixed(1)}K`} color={C.hi} />
            <MetricCard
              label="Total P&L"
              value={`${stats.totalPnl >= 0 ? "+" : ""}₹${stats.totalPnl.toFixed(0)}`}
              sub={`${stats.totalPnlPct.toFixed(2)}%`}
              color={pnlColor}
            />
            <MetricCard label="Win Rate"    value={`${stats.winRate.toFixed(1)}%`}   sub={`${stats.wins}W / ${stats.losses}L`} color={stats.winRate >= 50 ? C.green : C.red} />
            <MetricCard label="Trades"      value={String(stats.totalTrades)} color={C.amber} />
            <MetricCard label="Profit Factor" value={stats.profitFactor === 999 ? "∞" : stats.profitFactor.toFixed(2)} color={stats.profitFactor >= 1.5 ? C.green : C.red} />
            <MetricCard label="Max DD"      value={`₹${Math.abs(stats.drawdown).toFixed(0)}`} color={C.red} />
            <div style={{ flex: 1, minWidth: 200, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Label>Equity Curve</Label>
              <div style={{ marginTop: 6 }}><EquitySparkline /></div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {([["positions", "POSITIONS", <TrendingUp size={11} />], ["orders", "ORDER LOG", <Clock size={11} />]] as const).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "8px 16px", background: "none", border: "none",
                borderBottom: tab === id ? `2px solid ${C.accent}` : "2px solid transparent",
                color: tab === id ? C.accent : C.text, cursor: "pointer",
                fontFamily: C.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
              }}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          {tab === "positions" && <PositionCards />}
          {tab === "orders"    && <OrderHistory />}
        </div>
      </div>
    </div>
  );
}
