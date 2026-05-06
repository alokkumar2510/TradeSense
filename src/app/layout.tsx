import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "@/lib/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeSense Pro — Intelligent Stock Analysis",
  description:
    "Real-time stock analysis with multi-indicator signals, professional charting, portfolio tracking, and realistic profit calculation for Indian markets.",
  keywords: ["stock analysis", "TradeSense", "RSI", "MACD", "portfolio", "NSE", "BSE", "Indian stocks"],
  openGraph: {
    title:       "TradeSense Pro",
    description: "Intelligent stock analysis platform for Indian markets",
    type:        "website",
    url:         "https://tradesense.alokkumarsahu.in",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060A10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
