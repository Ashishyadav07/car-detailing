import React, { useState, useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import Navbar from './components/Navbar'
import CarViewer from './components/CarViewer'
import HeroSection from './components/HeroSection'
import ConfiguratorUI from './components/ConfiguratorUI'
import DragHint from './components/DragHint'
import BuildSummaryModal from './components/BuildSummaryModal'
import ServicesSection from './components/ServicesSection'
import AboutSection from './components/AboutSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import { CAMERA_PRESETS } from './constants/configuratorOptions'

function App() {
  // Reusable configuration state system keeping all options active simultaneously
  const [config, setConfig] = useState({
    paint: 'obsidian-black',
    rim: 'silver-chrome',
    tire: 'performance-matte',
    brake: 'brembo-red',
    interior: 'black-leather',
  })

  // Camera preset view state
  const [activeCameraPreset, setActiveCameraPreset] = useState('hero-34')

  // User interaction & hint visibility state
  const [hasInteracted, setHasInteracted] = useState(false)

  // Expandable "Your Build" summary modal state
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  // Hero section container ref and scroll progress tracking
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  })

  // Synchronize Active Feature Button highlight cleanly on DOM scroll progress changes
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    let newActiveId = 'hero-34'
    if (latest >= 0.11 && latest < 0.35) {
      newActiveId = 'side'
    } else if (latest >= 0.35 && latest < 0.60) {
      newActiveId = 'wheels'
    } else if (latest >= 0.60 && latest < 0.80) {
      newActiveId = 'front'
    } else {
      newActiveId = 'hero-34'
    }

    setActiveCameraPreset((prev) => (prev !== newActiveId ? newActiveId : prev))
  })


  const handleChangeConfig = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleUserInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  // Unified Preset Selection: Smoothly scrolls page to preset's canonical scrollP position
  const handleSelectCameraPreset = (presetId) => {
    setActiveCameraPreset(presetId)

    const preset = CAMERA_PRESETS.find((p) => p.id === presetId)
    if (preset && heroRef.current) {
      const heroTop = heroRef.current.offsetTop
      const heroHeight = heroRef.current.offsetHeight
      const windowHeight = window.innerHeight
      const targetScrollY = heroTop + preset.scrollP * (heroHeight - windowHeight)

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-[#08090c] font-sans text-white">
      {/* Boxed Floating Fixed Navbar */}
      <Navbar onOpenSummary={() => setIsSummaryOpen(true)} />

      {/* 1. SCROLL-DRIVEN HERO SECTION (400vh tall container with sticky 100vh viewport) */}
      <section ref={heroRef} id="experience" className="relative w-full h-[400vh]">
        <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden">

          {/* Subtle Drag-to-Explore Interaction Hint */}
          <DragHint visible={!hasInteracted} />

          {/* 3D Cinematic Car Viewer Canvas */}
          <CarViewer
            config={config}
            cameraPresetId={activeCameraPreset}
            onUserInteract={handleUserInteract}
            scrollYProgress={scrollYProgress}
          />


          {/* Minimal Hero Branding HUD Overlay & Scroll Progress Bar */}
          <HeroSection scrollYProgress={scrollYProgress} />

          {/* Floating Customization Control Dock */}
          <ConfiguratorUI
            config={config}
            onChangeConfig={handleChangeConfig}
            activeCameraPreset={activeCameraPreset}
            onSelectCameraPreset={handleSelectCameraPreset}
          />
        </div>
      </section>


      {/* 2. BESPOKE SERVICES SECTION */}
      <ServicesSection />

      {/* 3. ABOUT & STUDIO CAPABILITIES SECTION */}
      <AboutSection />

      {/* 4. CONTACT & BOOKING SECTION */}
      <ContactSection />

      {/* 5. FOOTER */}
      <Footer />

      {/* Expandable "Your Build" Summary Modal */}
      <BuildSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        config={config}
      />
    </div>
  )
}

export default App

