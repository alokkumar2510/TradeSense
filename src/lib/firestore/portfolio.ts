import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Transaction, Holding, ChargesBreakdown, Exchange, TradeType } from "@/types";

// ─── Transactions ────────────────────────────────────────────────────────────

export async function addTransaction(
  userId: string,
  payload: {
    symbol: string;
    exchange: Exchange;
    type: TradeType;
    quantity: number;
    price: number;
    date: string;
    charges: ChargesBreakdown;
  }
): Promise<void> {
  const txnRef = doc(collection(db, "portfolio", userId, "transactions"));
  const holdingRef = doc(db, "portfolio", userId, "holdings", payload.symbol);

  await runTransaction(db, async (t) => {
    const holdingSnap = await t.get(holdingRef);

    if (payload.type === "BUY") {
      const current = holdingSnap.exists()
        ? (holdingSnap.data() as Holding)
        : { quantity: 0, totalInvestment: 0 };

      const newQty        = current.quantity + payload.quantity;
      const newInvestment = current.totalInvestment + payload.quantity * payload.price + payload.charges.total;

      t.set(holdingRef, {
        symbol:          payload.symbol,
        exchange:        payload.exchange,
        quantity:        newQty,
        totalInvestment: newInvestment,
        updatedAt:       serverTimestamp(),
      });
    } else {
      // SELL — reduce holding
      if (!holdingSnap.exists()) throw new Error("Cannot sell — no holding found");
      const current = holdingSnap.data() as Holding;
      if (current.quantity < payload.quantity) throw new Error("Insufficient quantity to sell");

      const newQty = current.quantity - payload.quantity;
      if (newQty === 0) {
        t.delete(holdingRef);
      } else {
        const costPerShare = current.totalInvestment / current.quantity;
        t.update(holdingRef, {
          quantity:        newQty,
          totalInvestment: newQty * costPerShare,
          updatedAt:       serverTimestamp(),
        });
      }
    }

    // Write transaction record
    t.set(txnRef, {
      ...payload,
      txnId:     txnRef.id,
      userId,
      createdAt: serverTimestamp(),
    });
  });
}

export async function getTransactions(userId: string, symbol?: string): Promise<Transaction[]> {
  const col = collection(db, "portfolio", userId, "transactions");
  const constraints = symbol
    ? [where("symbol", "==", symbol), orderBy("date", "desc")]
    : [orderBy("date", "desc")];

  const snap = await getDocs(query(col, ...constraints));
  return snap.docs.map((d) => ({ ...d.data(), txnId: d.id } as Transaction));
}

// ─── Holdings ────────────────────────────────────────────────────────────────

export async function getHoldings(userId: string): Promise<Holding[]> {
  const snap = await getDocs(collection(db, "portfolio", userId, "holdings"));
  return snap.docs.map((d) => {
    const data = d.data() as Omit<Holding, "avgBuyPrice">;
    return {
      ...data,
      avgBuyPrice: data.quantity > 0 ? data.totalInvestment / data.quantity : 0,
    };
  });
}
