"use client";

import { useState, type FormEvent } from "react";
import { X, Calculator } from "lucide-react";
import { calculateCharges, formatINR } from "@/lib/profitEngine";
import type { Exchange, TradeType, AddTradePayload } from "@/types";
import styles from "./AddTradeModal.module.css";

interface Props {
  onClose:  () => void;
  onSubmit: (payload: AddTradePayload) => Promise<void>;
}

export default function AddTradeModal({ onClose, onSubmit }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [symbol,   setSymbol]   = useState("");
  const [exchange, setExchange] = useState<Exchange>("NSE");
  const [type,     setType]     = useState<TradeType>("BUY");
  const [qty,      setQty]      = useState("");
  const [price,    setPrice]    = useState("");
  const [date,     setDate]     = useState(today);
  const [submitting, setSubmitting] = useState(false);
  const [error,    setError]    = useState("");

  const numQty   = parseFloat(qty)   || 0;
  const numPrice = parseFloat(price) || 0;
  const charges  = numQty > 0 && numPrice > 0 ? calculateCharges(numPrice, numQty, type) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!symbol.trim())    return setError("Symbol is required");
    if (numQty <= 0)       return setError("Quantity must be > 0");
    if (numPrice <= 0)     return setError("Price must be > 0");
    if (!date)             return setError("Date is required");

    setSubmitting(true);
    try {
      await onSubmit({ symbol: symbol.toUpperCase().trim(), exchange, type, quantity: numQty, price: numPrice, date });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add trade");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Add Trade</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Type toggle */}
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`btn ${type === "BUY" ? styles.buyActive : "btn-ghost"}`}
              onClick={() => setType("BUY")}
            >BUY</button>
            <button
              type="button"
              className={`btn ${type === "SELL" ? styles.sellActive : "btn-ghost"}`}
              onClick={() => setType("SELL")}
            >SELL</button>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Symbol</label>
              <input className="input" placeholder="RELIANCE.NS" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
            </div>
            <div className={styles.field}>
              <label>Exchange</label>
              <select className={`input ${styles.select}`} value={exchange} onChange={(e) => setExchange(e.target.value as Exchange)}>
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Quantity</label>
              <input className="input" type="number" min="1" placeholder="10" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Price per share (₹)</label>
              <input className="input" type="number" min="0.01" step="0.01" placeholder="2400.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Trade Date</label>
            <input className="input" type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Charges preview */}
          {charges && (
            <div className={styles.chargesBox}>
              <div className={styles.chargesHeader}><Calculator size={14} /> Estimated Charges</div>
              <div className={styles.chargeRow}><span>Trade Value</span><span className="mono">{formatINR(numQty * numPrice)}</span></div>
              <div className={styles.chargeRow}><span>Brokerage</span><span className="mono">{formatINR(charges.brokerage)}</span></div>
              <div className={styles.chargeRow}><span>STT</span><span className="mono">{formatINR(charges.stt)}</span></div>
              <div className={styles.chargeRow}><span>GST</span><span className="mono">{formatINR(charges.gst)}</span></div>
              <div className={styles.chargeRow}><span>Stamp Duty</span><span className="mono">{formatINR(charges.stampDuty)}</span></div>
              <div className={styles.chargeRow}><span>Exchange</span><span className="mono">{formatINR(charges.exchangeCharge)}</span></div>
              <div className={`${styles.chargeRow} ${styles.totalRow}`}>
                <span>Total Charges</span>
                <span className="mono negative">{formatINR(charges.total)}</span>
              </div>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button
            id="add-trade-submit-btn"
            type="submit"
            className={`btn btn-primary`}
            style={{ width: "100%" }}
            disabled={submitting}
          >
            {submitting ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : `Confirm ${type}`}
          </button>
        </form>
      </div>
    </div>
  );
}
