"use client";

import type { NewsItem } from "@/types";
import { Newspaper, ExternalLink } from "lucide-react";
import styles from "./NewsFeed.module.css";

interface Props { news: NewsItem[]; }

const SENTIMENT_CONFIG = {
  Positive: { cls: "badge-green",  label: "Positive" },
  Neutral:  { cls: "badge-yellow", label: "Neutral"  },
  Negative: { cls: "badge-red",    label: "Negative" },
};

export default function NewsFeed({ news }: Props) {
  if (!news.length) return null;

  return (
    <div className="card">
      <div className={styles.header}>
        <Newspaper size={18} color="var(--accent-blue)" />
        <span className={styles.title}>News Sentiment</span>
        <span className={styles.count}>{news.length} articles</span>
      </div>
      <div className={styles.list}>
        {news.map((item) => {
          const cfg = SENTIMENT_CONFIG[item.sentiment];
          const date = new Date(item.publishedAt).toLocaleDateString("en-IN", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          });
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.item}
            >
              <div className={styles.itemTop}>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                <span className={styles.source}>{item.source}</span>
                <span className={styles.date}>{date}</span>
                <ExternalLink size={12} color="var(--text-muted)" />
              </div>
              <p className={styles.headline}>{item.title}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
