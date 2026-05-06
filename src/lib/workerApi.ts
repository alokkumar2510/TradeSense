import type { ApiResponse } from "@/types";

const WORKER = process.env.NEXT_PUBLIC_WORKER_URL ?? "http://localhost:8787";

async function workerFetch<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${WORKER}${path}`, {
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json() as ApiResponse<T>;
    return json;
  } catch {
    return {
      ok: false,
      error: "Network error — check your connection",
      code: "SERVER_ERROR",
    };
  }
}

export const workerApi = {
  quote:   (symbol: string)              => workerFetch(`/api/quote/${encodeURIComponent(symbol)}`),
  history: (symbol: string)              => workerFetch(`/api/history/${encodeURIComponent(symbol)}`),
  signal:  (symbol: string)              => workerFetch(`/api/signal/${encodeURIComponent(symbol)}`),
  news:    (symbol: string)              => workerFetch(`/api/news/${encodeURIComponent(symbol)}`),
  search:  (q: string)                   => workerFetch(`/api/search?q=${encodeURIComponent(q)}`),
};
