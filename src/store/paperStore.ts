import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT";
export type OrderStatus = "PENDING" | "FILLED" | "CANCELLED" | "TRIGGERED";

export interface Order {
  id:         string;
  symbol:     string;
  side:       OrderSide;
  type:       OrderType;
  qty:        number;
  price:      number;         // fill / limit price
  limitPrice?: number;
  sl?:        number;
  tp?:        number;
  status:     OrderStatus;
  createdAt:  number;
  filledAt?:  number;
  pnl?:       number;         // set on closing trade
}

export interface Position {
  symbol:    string;
  qty:       number;
  avgPrice:  number;
  side:      "LONG" | "SHORT";
  sl?:       number;
  tp?:       number;
  openedAt:  number;
  ltp:       number;          // last traded price (live)
  unrealPnl: number;
  pnlPct:    number;
}

export interface EquityPoint {
  ts:     number;             // epoch ms
  equity: number;
}

export interface PaperState {
  capital:      number;
  initialCapital: number;
  positions:    Record<string, Position>;   // keyed by symbol
  orders:       Order[];
  equity:       EquityPoint[];

  // Actions
  placeOrder:   (o: Omit<Order, "id"|"status"|"createdAt">) => string | null;
  cancelOrder:  (id: string) => void;
  tickPrice:    (symbol: string, ltp: number) => void;  // called on every quote tick
  reset:        () => void;
  setCapital:   (c: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();

const SLIPPAGE = 0.0005;  // 0.05%
const BROKERAGE = 0.0003; // 0.03% each side

function fillPrice(price: number, side: OrderSide) {
  return side === "BUY"
    ? price * (1 + SLIPPAGE)
    : price * (1 - SLIPPAGE);
}

function brokerageCost(price: number, qty: number) {
  return price * qty * BROKERAGE;
}

function updateEquity(
  positions: Record<string, Position>,
  cash: number,
  prev: EquityPoint[]
): EquityPoint[] {
  const posValue = Object.values(positions).reduce(
    (sum, p) => sum + p.ltp * p.qty, 0
  );
  const equity = cash + posValue;
  const last = prev[prev.length - 1];
  if (last && Math.abs(last.equity - equity) < 0.01) return prev;
  return [...prev.slice(-500), { ts: Date.now(), equity }];
}

// ─── Safe storage (survives private-browsing / corrupted JSON) ───────────────

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key: string, value: string): void => {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  removeItem: (key: string): void => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

// ─── Store ───────────────────────────────────────────────────────────────────

const makeDefaults = () => ({
  capital:        500_000,
  initialCapital: 500_000,
  positions:      {} as Record<string, Position>,
  orders:         [] as Order[],
  equity:         [{ ts: Date.now(), equity: 500_000 }] as EquityPoint[],
});

export const usePaperStore = create<PaperState>()(
  persist(
    (set, get) => ({
      ...makeDefaults(),

      setCapital: (c) =>
        set({ capital: c, initialCapital: c, equity: [{ ts: Date.now(), equity: c }] }),

      // ── Place order ───────────────────────────────────────────────
      placeOrder: (incoming) => {
        const state = get();
        const { capital, positions } = state;
        const { symbol, side, type, qty, price, limitPrice, sl, tp } = incoming;

        // Validate
        if (qty <= 0) return null;

        // Compute fill price
        const fp = type === "MARKET" ? fillPrice(price, side) : (limitPrice ?? price);
        const cost = fp * qty;
        const commission = brokerageCost(fp, qty);

        // ─ BUY ─
        if (side === "BUY") {
          const total = cost + commission;
          if (total > capital) return null; // insufficient funds

          const prev = positions[symbol];
          const newQty = (prev?.qty ?? 0) + qty;
          const newAvg = prev
            ? (prev.avgPrice * prev.qty + fp * qty) / newQty
            : fp;

          const pos: Position = {
            symbol, qty: newQty, avgPrice: newAvg,
            side: "LONG", sl, tp,
            openedAt: prev?.openedAt ?? Date.now(),
            ltp: fp, unrealPnl: 0, pnlPct: 0,
          };

          const order: Order = {
            id: uid(), symbol, side, type, qty,
            price: fp, limitPrice, sl, tp,
            status: type === "MARKET" ? "FILLED" : "PENDING",
            createdAt: Date.now(),
            filledAt: type === "MARKET" ? Date.now() : undefined,
          };

          set(s => ({
            capital: s.capital - total,
            positions: { ...s.positions, [symbol]: pos },
            orders: [order, ...s.orders],
            equity: updateEquity({ ...s.positions, [symbol]: pos }, s.capital - total, s.equity),
          }));
          return order.id;
        }

        // ─ SELL ─
        const pos = positions[symbol];
        if (!pos || pos.qty < qty) return null; // no position to sell

        const proceeds = fp * qty - commission;
        const realPnl = (fp - pos.avgPrice) * qty - commission * 2;
        const newQty = pos.qty - qty;

        const order: Order = {
          id: uid(), symbol, side, type, qty,
          price: fp, limitPrice, sl, tp,
          status: type === "MARKET" ? "FILLED" : "PENDING",
          createdAt: Date.now(),
          filledAt: type === "MARKET" ? Date.now() : undefined,
          pnl: realPnl,
        };

        set(s => {
          const newPositions = { ...s.positions };
          if (newQty <= 0) {
            delete newPositions[symbol];
          } else {
            newPositions[symbol] = { ...pos, qty: newQty };
          }
          return {
            capital: s.capital + proceeds,
            positions: newPositions,
            orders: [order, ...s.orders],
            equity: updateEquity(newPositions, s.capital + proceeds, s.equity),
          };
        });
        return order.id;
      },

      // ── Cancel pending order ───────────────────────────────────────
      cancelOrder: (id) =>
        set(s => ({
          orders: s.orders.map(o => o.id === id && o.status === "PENDING"
            ? { ...o, status: "CANCELLED" as OrderStatus }
            : o
          ),
        })),

      // ── Live price tick — updates unrealPnl + auto SL/TP ──────────
      tickPrice: (symbol, ltp) => {
        const state = get();
        const pos   = state.positions[symbol];
        if (!pos) return;

        const unrealPnl = (ltp - pos.avgPrice) * pos.qty;
        const pnlPct    = ((ltp - pos.avgPrice) / pos.avgPrice) * 100;
        const updated   = { ...pos, ltp, unrealPnl, pnlPct };

        // Auto-trigger SL
        if (pos.sl && ltp <= pos.sl) {
          get().placeOrder({ symbol, side: "SELL", type: "MARKET", qty: pos.qty, price: ltp });
          return;
        }
        // Auto-trigger TP
        if (pos.tp && ltp >= pos.tp) {
          get().placeOrder({ symbol, side: "SELL", type: "MARKET", qty: pos.qty, price: ltp });
          return;
        }

        set(s => ({
          positions: { ...s.positions, [symbol]: updated },
          equity: updateEquity({ ...s.positions, [symbol]: updated }, s.capital, s.equity),
        }));
      },

      // ── Reset ─────────────────────────────────────────────────────
      reset: () => set({
        ...makeDefaults(),
        initialCapital: 500_000,
        equity: [{ ts: Date.now(), equity: 500_000 }],
      }),
    }),
    {
      name: "tradesense-paper",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: s => ({
        capital: s.capital,
        initialCapital: s.initialCapital,
        positions: s.positions,
        orders: s.orders,
        equity: s.equity,
      }),
    }
  )
);

// ─── Derived selectors ───────────────────────────────────────────────────────

export function selectStats(s: PaperState) {
  const totalValue = Object.values(s.positions).reduce((acc, p) => acc + p.ltp * p.qty, 0);
  const netEquity  = s.capital + totalValue;
  const totalPnl   = netEquity - s.initialCapital;
  const totalPnlPct = (totalPnl / s.initialCapital) * 100;

  const closed = s.orders.filter(o => o.status === "FILLED" && o.side === "SELL");
  const wins   = closed.filter(o => (o.pnl ?? 0) > 0).length;
  const losses = closed.filter(o => (o.pnl ?? 0) <= 0).length;
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0;

  const grossProfit = closed.filter(o => (o.pnl ?? 0) > 0).reduce((s, o) => s + (o.pnl ?? 0), 0);
  const grossLoss   = Math.abs(closed.filter(o => (o.pnl ?? 0) < 0).reduce((s, o) => s + (o.pnl ?? 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  const drawdown = s.equity.length > 1
    ? (() => {
        let peak = s.equity[0].equity, maxDD = 0;
        for (const e of s.equity) { if (e.equity > peak) peak = e.equity; maxDD = Math.min(maxDD, e.equity - peak); }
        return maxDD;
      })()
    : 0;

  return {
    netEquity, totalPnl, totalPnlPct, winRate,
    wins, losses, totalTrades: closed.length,
    profitFactor, drawdown,
    availableCash: s.capital,
    positionValue: totalValue,
  };
}
