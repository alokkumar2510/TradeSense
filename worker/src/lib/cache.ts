import type { Env } from "../types";

/**
 * Generic cache-aside helper using Cloudflare KV.
 * Returns cached value or fetches fresh, stores in KV, and returns it.
 */
export async function getOrFetch<T>(
  env: Env,
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<{ data: T; fromCache: boolean }> {
  // Try cache first
  const cached = await env.CACHE.get<T>(key, "json");
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }

  // Fetch fresh data
  const fresh = await fetchFn();

  // Store in KV (non-blocking write via ctx.waitUntil is handled at call site)
  await env.CACHE.put(key, JSON.stringify(fresh), {
    expirationTtl: ttlSeconds,
  });

  return { data: fresh, fromCache: false };
}

/** TTL constants (seconds) */
export const TTL = {
  QUOTE:      60,   // 1 minute
  HISTORY:    300,  // 5 minutes
  INDICATORS: 300,  // 5 minutes
  SIGNAL:     300,  // 5 minutes
  NEWS:       600,  // 10 minutes
  SEARCH:     120,  // 2 minutes
} as const;
