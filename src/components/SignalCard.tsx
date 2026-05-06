"use client";

import type { Signal } from "@/types";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Zap } from "lucide-react";
import styles from "./SignalCard.module.css";

interface Props { signal: Signal | null; loading: boolean; }

const SIGNAL_CONFIG = {
  STRONG_BUY:       { label: "STRONG BUY",   color: "green",  icon: TrendingUp,   badgeClass: "badge-green"  },
  BUY:              { label: "BUY",           color: "green",  icon: TrendingUp,   badgeClass: "badge-green"  },
  HOLD:             { label: "HOLD",          color: "yellow", icon: Minus,        badgeClass: "badge-yellow" },
  SELL:             { label: "SELL",          color: "red",    icon: TrendingDown, badgeClass: "badge-red"    },
  STRONG_SELL:      { label: "STRONG SELL",   color: "red",    icon: TrendingDown, badgeClass: "badge-red"    },
  INSUFFICIENT_DATA:{ label: "INSUFFICIENT",  color: "muted",  icon: AlertTriangle,badgeClass: "badge-yellow" },
} as const;

export default function SignalCard({ signal, loading }: Props) {
  if (loading) return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <Zap size={18} color="var(--accent-blue)" />
        <span>Signal Engine</span>
      </div>
      <div className={styles.skeletonBlock}>
        <div className="skeleton" style={{ height: 40, width: 160, marginBottom: "1rem" }} />
        <div className="skeleton" style={{ height: 16, marginBottom: "0.5rem" }} />
        <div className="skeleton" style={{ height: 16, marginBottom: "0.5rem" }} />
        <div className="skeleton" style={{ height: 16, width: "70%" }} />
      </div>
    </div>
  );

  if (!signal) return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <Zap size={18} color="var(--accent-blue)" />
        <span>Signal Engine</span>
      </div>
      <p className={styles.empty}>Search a stock to generate a signal.</p>
    </div>
  );

  const cfg   = SIGNAL_CONFIG[signal.strength];
  const Icon  = cfg.icon;
  const score = signal.score;

  // Score bar: -100..+100 → 0..100%
  const barPct    = ((score + 100) / 200) * 100;
  const barColor  = score > 0 ? "var(--green)" : score < 0 ? "var(--red)" : "var(--yellow)";

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.header}>
        <Zap size={18} color="var(--accent-blue)" />
        <span>Signal Engine</span>
        <span className={`badge ${cfg.badgeClass}`}>
          <Icon size={11} /> {cfg.label}
        </span>
      </div>

      {/* Score meter */}
      <div className={styles.scoreSection}>
        <div className={styles.scoreLabel}>
          <span>Score</span>
          <span className={`mono ${score > 0 ? "positive" : score < 0 ? "negative" : "neutral"}`}>
            {score > 0 ? "+" : ""}{score}
          </span>
        </div>
        <div className={styles.scoreBar}>
          <div
            className={styles.scoreBarFill}
            style={{ width: `${barPct}%`, background: barColor }}
          />
        </div>
        <div className={styles.scoreScale}>
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Indicator summaries */}
      <div className={styles.indicators}>
        <div className={styles.indicatorRow}>
          <span className={styles.indicatorLabel}>RSI</span>
          <span className={styles.indicatorValue}>{signal.rsiSummary}</span>
        </div>
        <div className={styles.indicatorRow}>
          <span className={styles.indicatorLabel}>MACD</span>
          <span className={styles.indicatorValue}>{signal.macdSummary}</span>
        </div>
      </div>

      {/* Explanation */}
      <div className={styles.explanation}>
        <div className={styles.explanationTitle}>Analysis</div>
        <p className={styles.explanationText}>{signal.explanation}</p>
      </div>

      <div className={styles.timestamp}>
        Generated: {new Date(signal.generatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
