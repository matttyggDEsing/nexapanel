import LandingScene from '@/components/three/LandingScene'
import CustomCursor from '@/components/landing/CustomCursor'
import NoiseOverlay from '@/components/landing/NoiseOverlay'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import PlatformMarquee from '@/components/landing/PlatformMarquee'
import StatsStrip from '@/components/landing/StatsStrip'
import Features from '@/components/landing/Features'
import Sellers from '@/components/landing/Sellers'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="relative text-txt-primary font-sans overflow-x-hidden bg-bg-primary">
      <CustomCursor />
      <NoiseOverlay />

      <LandingScene fullPage />

      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(6,10,14,0) 0%, rgba(6,10,14,0.15) 15%, rgba(6,10,14,0) 30%, rgba(6,10,14,0.08) 50%, rgba(6,10,14,0) 70%, rgba(6,10,14,0.12) 85%, rgba(6,10,14,0) 100%)',
        }}
      />

      <Nav />

      <main className="relative z-[2]">
        <Hero />
        <PlatformMarquee />
        <StatsStrip />
        <Features />
        <Sellers />
      </main>

      <FinalCTA />
      <Footer />
    </div>
  )
}
