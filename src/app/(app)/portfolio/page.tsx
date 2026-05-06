"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatINR } from "@/lib/profitEngine";
import { PlusCircle, Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import AddTradeModal from "@/components/AddTradeModal";
import type { Holding, AddTradePayload } from "@/types";
import styles from "./portfolio.module.css";

export default function PortfolioPage() {
  const { user } = useAuth();
  const { holdings, loading, error, addTrade } = usePortfolio(user?.uid ?? null);
  const [showModal, setShowModal] = useState(false);

  const totalInvested = holdings.reduce((s, h) => s + h.totalInvestment, 0);
  const totalCurrent  = holdings.reduce((s, h) => s + (h.currentValue ?? h.totalInvestment), 0);
  const totalPL       = totalCurrent - totalInvested;
  const totalPLPct    = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  return (
    <div className="container animate-fadeUp">
      <div className={styles.pageHeader}>
        <div>
          <h1>Portfolio</h1>
          <p>Track your holdings and P&amp;L</p>
        </div>
        <button
          id="add-trade-btn"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <PlusCircle size={17} /> Add Trade
        </button>
      </div>

      {/* Summary cards */}
      <div className="stat-grid">
        <div className="card">
          <span className={styles.statLabel}>Invested</span>
          <span className={`${styles.statValue} mono`}>{formatINR(totalInvested)}</span>
        </div>
        <div className="card">
          <span className={styles.statLabel}>Current Value</span>
          <span className={`${styles.statValue} mono`}>{formatINR(totalCurrent)}</span>
        </div>
        <div className="card">
          <span className={styles.statLabel}>Overall P&amp;L</span>
          <span className={`${styles.statValue} mono ${totalPL >= 0 ? "positive" : "negative"}`}>
            {totalPL >= 0 ? "+" : ""}{formatINR(totalPL)} ({totalPLPct.toFixed(2)}%)
          </span>
        </div>
        <div className="card">
          <span className={styles.statLabel}>Holdings</span>
          <span className={`${styles.statValue} mono`}>{holdings.length}</span>
        </div>
      </div>

      {/* Holdings table */}
      {loading ? (
        <div className={styles.loadingBlock}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 8 }} />
          ))}
        </div>
      ) : holdings.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase size={48} color="var(--text-muted)" />
          <h3>No holdings yet</h3>
          <p>Add your first trade to start tracking your portfolio.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <PlusCircle size={16} /> Add First Trade
          </button>
        </div>
      ) : (
        <div className="table-wrapper" style={{ marginTop: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Exchange</th>
                <th>Qty</th>
                <th>Avg Price</th>
                <th>Invested</th>
                <th>P&amp;L</th>
                <th>P&amp;L %</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const pl    = (h.currentValue ?? h.totalInvestment) - h.totalInvestment;
                const plPct = h.totalInvestment > 0 ? (pl / h.totalInvestment) * 100 : 0;
                return (
                  <tr key={h.symbol}>
                    <td><strong>{h.symbol}</strong></td>
                    <td><span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>{h.exchange}</span></td>
                    <td className="mono">{h.quantity}</td>
                    <td className="mono">{formatINR(h.avgBuyPrice)}</td>
                    <td className="mono">{formatINR(h.totalInvestment)}</td>
                    <td className={`mono ${pl >= 0 ? "positive" : "negative"}`}>
                      {pl >= 0 ? "+" : ""}{formatINR(pl)}
                    </td>
                    <td>
                      <span className={`badge ${pl >= 0 ? "badge-green" : "badge-red"}`}>
                        {pl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {plPct >= 0 ? "+" : ""}{plPct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddTradeModal
          onClose={() => setShowModal(false)}
          onSubmit={async (payload: AddTradePayload) => {
            await addTrade(payload);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
