import type { ChargesBreakdown, ProfitCalculation, TaxType, Transaction } from "@/types";

// ─── Indian Brokerage & Charges (configurable) ───────────────────────────────
const BROKERAGE_RATE     = 0.0003;  // 0.03% per leg (discount broker)
const BROKERAGE_MAX      = 20;      // ₹20 max per order
const STT_BUY            = 0.001;   // 0.1% on buy (equity delivery)
const STT_SELL           = 0.001;   // 0.1% on sell (equity delivery)
const EXCHANGE_CHARGE    = 0.0000345; // NSE exchange charge
const GST_ON_BROKERAGE   = 0.18;    // 18% GST on brokerage + exchange
const STAMP_DUTY_BUY     = 0.00015; // 0.015% on buy
const LTCG_RATE          = 0.10;    // 10% on gains above ₹1L
const STCG_RATE          = 0.15;    // 15% flat
const LTCG_EXEMPTION     = 100_000; // ₹1 lakh annual exemption
const HOLDING_PERIOD_DAYS = 365;    // 1 year for LTCG

export function calculateCharges(
  price: number,
  quantity: number,
  type: "BUY" | "SELL"
): ChargesBreakdown {
  const tradeValue = price * quantity;

  const brokerage    = Math.min(tradeValue * BROKERAGE_RATE, BROKERAGE_MAX);
  const stt          = type === "BUY" ? tradeValue * STT_BUY : tradeValue * STT_SELL;
  const exchangeCharge = tradeValue * EXCHANGE_CHARGE;
  const gst          = (brokerage + exchangeCharge) * GST_ON_BROKERAGE;
  const stampDuty    = type === "BUY" ? tradeValue * STAMP_DUTY_BUY : 0;

  const total = brokerage + stt + exchangeCharge + gst + stampDuty;

  return {
    brokerage:      round2(brokerage),
    stt:            round2(stt),
    exchangeCharge: round2(exchangeCharge),
    gst:            round2(gst),
    stampDuty:      round2(stampDuty),
    total:          round2(total),
  };
}

export function calculateProfit(
  buyTxn: Transaction,
  sellPrice: number,
  sellQuantity: number,
  sellDate: string
): ProfitCalculation {
  const buyValue    = buyTxn.price * sellQuantity;
  const sellValue   = sellPrice * sellQuantity;
  const grossProfit = sellValue - buyValue;

  // Charges on sell side only (buy charges already in cost basis)
  const sellCharges = calculateCharges(sellPrice, sellQuantity, "SELL");

  // Holding period
  const buyDate    = new Date(buyTxn.date);
  const saleDateObj = new Date(sellDate);
  const holdingDays = Math.floor(
    (saleDateObj.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const taxType: TaxType = holdingDays >= HOLDING_PERIOD_DAYS ? "LTCG" : "STCG";

  // Net profit before tax
  const netBeforeTax = grossProfit - sellCharges.total - buyTxn.charges.total;

  // Tax calculation
  let taxableAmount = 0;
  let taxAmount     = 0;

  if (netBeforeTax > 0) {
    if (taxType === "LTCG") {
      taxableAmount = Math.max(0, netBeforeTax - LTCG_EXEMPTION);
      taxAmount     = taxableAmount * LTCG_RATE;
    } else {
      taxableAmount = netBeforeTax;
      taxAmount     = taxableAmount * STCG_RATE;
    }
  }

  const netProfit = netBeforeTax - taxAmount;

  return {
    grossProfit:  round2(grossProfit),
    charges:      sellCharges,
    taxType,
    taxableAmount: round2(taxableAmount),
    taxAmount:    round2(taxAmount),
    netProfit:    round2(netProfit),
    holdingDays,
  };
}

/** Format a number as ₹ currency */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
