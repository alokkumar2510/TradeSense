export type SentimentLabel = "Positive" | "Neutral" | "Negative";

const POSITIVE_WORDS = [
  "surge", "rally", "gain", "rise", "profit", "record", "growth",
  "beat", "strong", "bullish", "upgrade", "buy", "outperform",
  "dividend", "acquisition", "partnership", "expansion", "revenue",
  "positive", "upside", "recovery", "boost",
];

const NEGATIVE_WORDS = [
  "fall", "drop", "loss", "decline", "miss", "weak", "bearish",
  "downgrade", "sell", "underperform", "debt", "layoff", "fraud",
  "investigation", "lawsuit", "fine", "risk", "concern", "warning",
  "negative", "downside", "crash", "bankruptcy", "default",
];

export function classifySentiment(title: string, body = ""): SentimentLabel {
  const text = `${title} ${body}`.toLowerCase();

  let score = 0;
  for (const w of POSITIVE_WORDS) if (text.includes(w)) score++;
  for (const w of NEGATIVE_WORDS) if (text.includes(w)) score--;

  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
}
