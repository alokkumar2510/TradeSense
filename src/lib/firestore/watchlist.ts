import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Exchange, WatchlistItem } from "@/types";

const watchlistCol = (uid: string) =>
  collection(db, "watchlist", uid, "stocks");

export async function getWatchlist(uid: string): Promise<WatchlistItem[]> {
  const snap = await getDocs(watchlistCol(uid));
  return snap.docs.map((d) => ({ symbol: d.id, ...d.data() } as WatchlistItem));
}

export async function addToWatchlist(
  uid: string,
  symbol: string,
  exchange: Exchange = "NSE"
): Promise<void> {
  const ref = doc(watchlistCol(uid), symbol);
  await setDoc(ref, { symbol, exchange, addedAt: serverTimestamp() }, { merge: true });
}

export async function removeFromWatchlist(uid: string, symbol: string): Promise<void> {
  await deleteDoc(doc(watchlistCol(uid), symbol));
}

export async function isInWatchlist(uid: string, symbol: string): Promise<boolean> {
  const snap = await getDoc(doc(watchlistCol(uid), symbol));
  return snap.exists();
}
