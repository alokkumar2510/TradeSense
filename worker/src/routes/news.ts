import type { Env } from "../types";
import { fetchNews } from "../services/fmp";
import { classifySentiment } from "../services/sentiment";
import { getOrFetch, TTL } from "../lib/cache";
import { jsonResponse, errorResponse } from "../lib/response";

export async function handleNews(symbol: string, env: Env): Promise<Response> {
  try {
    const { data: rawNews } = await getOrFetch(
      env,
      `news:${symbol}`,
      TTL.NEWS,
      () => fetchNews(symbol, env, 10)
    );

    // Classify sentiment server-side
    const news = rawNews.map((item, i) => ({
      id:          `${symbol}-${i}`,
      title:       item.title,
      url:         item.url,
      source:      item.site,
      publishedAt: item.publishedDate,
      image:       item.image,
      sentiment:   classifySentiment(item.title, item.text),
    }));

    return jsonResponse({ ok: true, data: news });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("RATE_LIMITED")) return errorResponse("Rate limited", "RATE_LIMITED", 429);
    return errorResponse("Failed to fetch news", "SERVER_ERROR", 500);
  }
}
