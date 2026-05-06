// Cloudflare Worker environment bindings
export interface Env {
  // KV Namespace (bound in wrangler.toml)
  CACHE: KVNamespace;

  // Secrets (set via `wrangler secret put`)
  FMP_API_KEY:    string;
  ALPHA_VANTAGE_KEY: string;

  // Vars
  ENVIRONMENT: string;
}
