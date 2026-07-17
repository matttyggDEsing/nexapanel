import { useRef } from 'react'
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
  // La escena 3D (CoreOrb + red de nodos + grid + formas flotantes) mide
  // el scroll contra este mismo contenedor, así que se densifica/gira
  // más a medida que se avanza por toda la landing, no solo el hero.
  const sceneZoneRef = useRef(null)

  return (
    <div className="relative text-txt-primary font-sans overflow-x-hidden bg-bg-primary">
      <CustomCursor />
      <NoiseOverlay />
      <Nav />

      <div ref={sceneZoneRef} className="relative">
        <LandingScene targetRef={sceneZoneRef} />

        <div className="relative z-[1]">
          <Hero />
          <PlatformMarquee />
          <StatsStrip />
          <Features />
          <Sellers />
        </div>
      </div>

      <FinalCTA />
      <Footer />
    </div>
  )
}
