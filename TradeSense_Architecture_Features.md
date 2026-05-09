# TradeSense Pro - Architecture & Features Overview

This document provides a comprehensive breakdown of the TradeSense Pro platform's architecture, feature set, technology stack, and UI/UX design choices. It is designed to provide sufficient context to an LLM for building a landing page or new features.

---

## 1. Project Overview

TradeSense Pro is a high-fidelity, professional-grade trading terminal and intelligence suite. It is designed to be a data-dense, highly responsive workstation featuring a modular widget system, deterministic analytical engines, and real-time market data flows, modeled after industry leaders like Bloomberg and TradingView Pro.

---

## 2. System Architecture

```text
[ Client / Browser ]
        │
        ▼
[ Frontend: Next.js (Cloudflare Pages) ]
  │       │       │
  │       │       ├──► [ Global State: Zustand ]
  │       │       │
  │       │       └──► [ Auth & Storage: Firebase ]
  │       │               - Google Sign-In
  │       │               - Firestore (Portfolio, Watchlist, User Settings)
  │       │
  │       ▼
[ API Gateway: Cloudflare Worker ]
  │       │       │
  │       │       └──► [ Cache: Cloudflare KV ]
  │       │               - Caches external API responses to reduce latency & cost
  │       │
  │       ▼
[ External Data Providers ]
  │
  ├──► [ Financial Modeling Prep (FMP) API ]
  │       - Real-time stock quotes, historical data, company profiles, news
  │
  ├──► [ Alpha Vantage API ]
  │       - Technical indicators (RSI, MACD, etc.)
  │
  └──► [ Yahoo Finance / Alternatives ]
          - Real-time market indices and backup data sources
```

---

## 3. Technology Stack

*   **Frontend Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript throughout the entire stack
*   **State Management**: Zustand (`useMarketStore` for global active ticker, quote, history, and news states)
*   **Styling**: Pure CSS Modules and CSS Variables (no Tailwind), focused on high-performance custom layouts
*   **Authentication**: Firebase Authentication (Google Sign-In)
*   **Database**: Firebase Firestore (for Portfolio & Trade Tracking)
*   **Serverless API**: Cloudflare Workers
*   **Caching**: Cloudflare KV
*   **Deployment**: Cloudflare Pages (Frontend) & Cloudflare Workers (Backend)
*   **Market Data APIs**: Financial Modeling Prep (FMP), Alpha Vantage, Yahoo Finance

---

## 4. Core Features

### 4.1. Trading Terminal & Dashboard
*   **High-Density Grid Layout**: Uses precise CSS variables (`--right-rail-w`, `--bottom-grid-h`) to construct a workstation-style layout prioritizing vertical screen space for charting.
*   **Real-Time Scrolling Ticker Bar**: Live market indices (NIFTY 50, SENSEX, BANK NIFTY, VIX, etc.) auto-polling every 30 seconds.
*   **Dynamic Market Status**: Real-time NSE Open/Closed badge calculated from IST trading hours.
*   **Global Command Palette (`Cmd+K`)**: Instant symbol search modal connected to the backend for fast navigation.
*   **Real-time Stock Charting**: High-fidelity charting component (`StockChart.tsx`).
*   **Signal Cards**: Visual representation of buy/sell signals (`SignalCard.tsx`).
*   **Bottom Grid Widget System**: Modular layout for secondary analytics (`BottomGrid.tsx`).

### 4.2. Analytical Engines (The "Intelligence Suite")
*   **Consensus Engine**: Aggregates various metrics to provide a unified buy/sell/hold consensus (`ConsensusEngine.tsx`).
*   **Emotion Engine**: Gauges market sentiment (Fear/Greed index style metrics) (`EmotionEngine.tsx`).
*   **Risk Engine**: Evaluates the risk profile of specific assets based on volatility and other factors (`RiskEngine.tsx`).
*   **Momentum Pulse**: Tracks the speed and strength of price movements (`MomentumPulse.tsx`).
*   **Institutional Activity**: Monitors block trades or SEC filings to gauge "smart money" movements (`InstitutionalActivity.tsx`).
*   **Profit Engine**: Built-in calculator for STCG (Short-Term Capital Gains), LTCG (Long-Term Capital Gains), and broker/exchange charges (`profitEngine.ts`).

### 4.3. Portfolio & Watchlist Management
*   **Trade Tracking**: Add trades (`AddTradeModal.tsx`) and view summaries (`TradeSummary.tsx`).
*   **Firestore Sync**: Real-time synchronization of portfolio holdings and watchlists to the cloud.
*   **Paper Trading**: Simulated trading environment to test strategies (`/paper-trade`).

### 4.4. Market News & Discovery
*   **News Feed**: Real-time financial news integration (`NewsFeed.tsx`).
*   **Market Overview**: Broad market statistics and indices tracking (`StockStats.tsx`).

---

## 5. UI/UX & Design System

The application relies on a strictly defined set of CSS tokens in `globals.css` for a "Dark Mode" native, premium terminal aesthetic.

*   **Color Palette**: Deep space backgrounds (`--bg-base`, `#02050C`), distinct elevated surfaces, accented by neon greens (`#00FFB2`) and terminal blues (`#3D8EFF`).
*   **Typography**: Clean, monospace-heavy UI using `JetBrains Mono` or `Fira Code` for numerical data and `Inter` for prose.
*   **Micro-Animations & Flourishes**:
    *   `priceFlash` / `priceFlashRed`: Background pulses when live prices update.
    *   `slideInRight` / `slideInUp`: Smooth entrance animations for side panels and widgets.
    *   `expandWidth`: Animated progress bars for Consensus and Emotion engines.
    *   `ticker-scroll`: Endless smooth CSS marquee for the market index bar.
*   **Hover States**: Subtle `rgba(255,255,255,0.015)` shimmers across grid cells and data points for interactive feedback.

---

## 6. Frontend Architecture (`src/`)

### 6.1. App Router Structure (`src/app/`)
*   `/(app)/dashboard/` - Main trading terminal view.
*   `/(app)/analytics/` - Deep dive into specific stock metrics.
*   `/(app)/markets/` - Broad market overview.
*   `/(app)/portfolio/` - User's holdings and trade history.
*   `/(app)/strategy-lab/` - Strategy backtesting and modeling.
*   `/(app)/replay/` - Market replay feature.
*   `/(app)/paper-trade/` - Simulated trading.
*   `/(app)/settings/` - User preferences.
*   `/(app)/signals/` - Aggregated trading signals.
*   `/(app)/watchlist/` - Tracked stocks.
*   `/login/` - Authentication entry point.
*   `/(app)/layout.tsx` - Main authenticated layout, including the Sidebar/Navbar.

### 6.2. Key Directories
*   `src/components/`: Reusable UI widgets and terminal components.
*   `src/lib/`: Core business logic, Firebase initialization, and Worker API client.
    *   `profitEngine.ts`: Tax and charge calculation logic.
    *   `analyticsEngine.ts`: Frontend calculation models.
    *   `workerApi.ts`: Client wrapper for fetching data from the Cloudflare Worker.
    *   `firestore/`: Firebase database helper functions.
*   `src/store/`: Zustand global state slices (`marketStore.ts`).
*   `src/types/`: Shared TypeScript interfaces.
*   `src/context/` & `src/providers/`: Global state management and theme/auth providers.

---

## 7. Backend Architecture (`worker/`)

The Cloudflare Worker acts as a secure proxy and data aggregation layer. It hides API keys from the client and caches expensive API calls.

### 7.1. Routes (`worker/src/routes/`)
*   `stock.ts`: Endpoints for fetching quotes, history, and technical indicators.
*   `news.ts`: Endpoints for fetching market or ticker-specific news.

### 7.2. Services (`worker/src/services/`)
*   `fmp.ts`: Wrapper for Financial Modeling Prep API endpoints (stable versions).
*   `alphaVantage.ts`: Wrapper for Alpha Vantage API.
*   `signalEngine.ts`: Server-side logic for generating technical signals (RSI + MACD crossovers).
*   `analyticsEngine.ts`: Server-side data crunching before sending to the client.
*   `sentiment.ts`: Logic for parsing news or data into sentiment scores.

### 7.3. Caching Strategy
*   Uses Cloudflare KV (`CACHE` namespace) to store responses from FMP and Alpha Vantage for a specified TTL (Time To Live), preventing rate limiting and lowering latency for subsequent requests.

---

## 8. Security Architecture

1.  **API Key Protection**: FMP and Alpha Vantage keys are stored securely as Cloudflare Secrets and are *never* exposed to the browser.
2.  **Data Isolation**: Firebase Firestore rules enforce strictly that users can only read/write their own data (`uid == request.auth.uid`).
3.  **Input Validation**: The Cloudflare Worker validates all incoming requests and sanitizes ticker symbols before making upstream API requests.



add editable founder section so that i will add my dettails , social media handles and image later.
