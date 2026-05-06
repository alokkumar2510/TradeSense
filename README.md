# TradeSense Pro — Setup Guide

## Prerequisites
- Node.js 18+
- Cloudflare account (Pages + Workers + KV)
- Firebase project (Auth + Firestore)
- Financial Modeling Prep API key
- Alpha Vantage API key

---

## 1. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Google Sign-In** in Authentication > Sign-in method
3. Create a **Firestore** database in production mode
4. Deploy security rules: `firebase deploy --only firestore:rules`
5. Copy your Firebase config into `.env.local` (use `.env.local.example` as template)

---

## 2. Cloudflare Worker Setup

```bash
cd worker
npm install
```

### Create KV namespace:
```bash
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --preview
```

Paste the IDs into `worker/wrangler.toml`.

### Add secrets (never commit these):
```bash
wrangler secret put FMP_API_KEY
wrangler secret put ALPHA_VANTAGE_KEY
```

### Run locally:
```bash
npm run dev   # starts on http://localhost:8787
```

---

## 3. Next.js Setup

```bash
# At project root
cp .env.local.example .env.local
# Fill in your Firebase config values

npm run dev   # starts on http://localhost:3000
```

---

## 4. Deployment

### Worker:
```bash
cd worker
npm run deploy
```

### Frontend (Cloudflare Pages):
- Connect your GitHub repo to Cloudflare Pages
- Build command: `npm run build`
- Output directory: `out`
- Set environment variables in CF Pages dashboard (same as `.env.local`)

---

## Architecture

```
Browser → Cloudflare Pages (Next.js)
              ↓ Auth: Firebase Google Sign-In
              ↓ Data: Cloudflare Worker (API Gateway)
                          ↓ FMP API (quote, history, news)
                          ↓ Alpha Vantage (RSI, MACD)
                          ↓ Cloudflare KV (cache)
              ↓ Storage: Firebase Firestore (portfolio, watchlist)
```

## Security
- API keys live **only** in Cloudflare Worker environment (never in browser)
- Firestore rules enforce `uid == request.auth.uid` on all operations
- Worker validates inputs before any external API call

## Key Files
| File | Purpose |
|---|---|
| `worker/src/index.ts` | Worker router |
| `worker/src/services/signalEngine.ts` | RSI+MACD signal logic |
| `worker/src/services/fmp.ts` | FMP API wrapper |
| `worker/src/services/alphaVantage.ts` | AV RSI/MACD wrapper |
| `worker/src/lib/cache.ts` | KV cache helper |
| `src/lib/profitEngine.ts` | STCG/LTCG + charges calculator |
| `src/lib/firestore/portfolio.ts` | Portfolio Firestore ops |
| `src/lib/workerApi.ts` | Frontend Worker client |
| `firestore.rules` | Firestore security rules |
