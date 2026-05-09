import Navigation from '@/components/landing/Navigation';
import Hero from '@/components/landing/Hero';
import TickerStream from '@/components/landing/TickerStream';
import IntelligenceSection from '@/components/landing/IntelligenceSection';
import StrategyLab from '@/components/landing/StrategyLab';
import QuantTooling from '@/components/landing/QuantTooling';
import InstitutionalFlow from '@/components/landing/InstitutionalFlow';
import ReplayPaperTrade from '@/components/landing/ReplayPaperTrade';
import Infrastructure from '@/components/landing/Infrastructure';
import FounderSection from '@/components/landing/FounderSection';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <main className={styles.landing}>
      <div className={styles.ambientGrid} aria-hidden />
      <div className={`${styles.ambientGlow} ${styles.ambientGlowTop}`} aria-hidden />
      <div className={`${styles.ambientGlow} ${styles.ambientGlowMid}`} aria-hidden />

      <Navigation />
      <Hero />
      <TickerStream />
      <IntelligenceSection />
      <StrategyLab />
      <QuantTooling />
      <InstitutionalFlow />
      <ReplayPaperTrade />
      <Infrastructure />
      <FounderSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
