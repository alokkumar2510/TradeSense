import type { Env } from "./types";
import { handleQuote, handleHistory, handleSignal, handleSearch, handleAnalysis } from "./routes/stock";
import { handleNews } from "./routes/news";
import { jsonResponse, errorResponse, handleOptions } from "./lib/response";

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") return handleOptions();
    if (path === "/health") return jsonResponse({ ok: true, version: "2.0.0" });

    // ─── Route: GET /api/search?q=RELIANCE ───────────────────────────────────
    if (path === "/api/search" && method === "GET") {
      const q = url.searchParams.get("q")?.trim();
      if (!q || q.length < 1) return errorResponse("Query param 'q' required", "SERVER_ERROR", 400);
      return handleSearch(q, env);
    }

    // ─── Routes: /api/{route}/{symbol}?tf=1Y ─────────────────────────────────
    const symbolMatch = path.match(/^\/api\/(quote|history|signal|news|analysis)\/(.+)$/);
    if (symbolMatch && method === "GET") {
      const [, route, rawSymbol] = symbolMatch;
      const symbol = decodeURIComponent(rawSymbol).toUpperCase().trim();

      if (!symbol || symbol.length > 20) return errorResponse("Invalid symbol", "NOT_FOUND", 400);

      switch (route) {
        case "quote":    return handleQuote(symbol, env);
        case "history":  return handleHistory(symbol, env, url);   // ← passes url for ?tf=
        case "signal":   return handleSignal(symbol, env);
        case "analysis": return handleAnalysis(symbol, env);
        case "news":     return handleNews(symbol, env);
      }
    }

    return errorResponse("Route not found", "NOT_FOUND", 404);
  },
};

export default worker;
