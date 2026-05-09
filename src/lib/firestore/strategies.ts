import {
  collection, doc, getDocs, addDoc, setDoc,
  deleteDoc, query, where, orderBy,
  serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Strategy } from "@/lib/strategySchema";

const COL = "strategies";

function toFS(s: Strategy) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = s;
  return { ...rest, updatedAt: serverTimestamp() };
}

function fromDoc(d: any): Strategy {
  const data = d.data();
  return {
    ...data,
    id: d.id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt,
  } as Strategy;
}

export async function listStrategies(uid: string): Promise<Strategy[]> {
  const q = query(collection(db, COL), where("uid", "==", uid), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function saveStrategy(strategy: Strategy): Promise<Strategy> {
  if (!strategy.id || strategy.id.length < 10) {
    // new
    const ref = await addDoc(collection(db, COL), {
      ...toFS(strategy),
      createdAt: serverTimestamp(),
    });
    return { ...strategy, id: ref.id };
  }
  await setDoc(doc(db, COL, strategy.id), toFS(strategy), { merge: true });
  return strategy;
}

export async function deleteStrategy(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function duplicateStrategy(s: Strategy, uid: string): Promise<Strategy> {
  const copy: Strategy = {
    ...s,
    id: crypto.randomUUID(),
    name: `${s.name} (copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    uid,
  };
  return saveStrategy(copy);
}
