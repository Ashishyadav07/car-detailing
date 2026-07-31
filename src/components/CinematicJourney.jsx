import React, { useRef } from 'react'
import { useScroll } from 'framer-motion'
import JourneyBackdrop from './journey/JourneyBackdrop'
import JourneyCarStage from './journey/JourneyCarStage'
import JourneyNarrative from './journey/JourneyNarrative'

// The cinematic continuation of the hero: a 400vh sticky stage where the car
// (same live build config as the hero) stays put in the foreground while the
// environment behind it moves through five AI-generated detailing scenes.
// Deliberately its own scroll container and its own <Canvas> — the hero's
// scroll-driven camera path is left untouched, and its canvas already pauses
// once out of view, so only one 3D scene is ever actually rendering.
export default function CinematicJourney({ config }) {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={sectionRef} id="the-journey" className="relative w-full h-[400vh] bg-[#08090c]">
      <div className="sticky top-0 left-0 w-full h-screen h-[100dvh] overflow-hidden">
        <JourneyBackdrop scrollYProgress={scrollYProgress} />

        {/* Atmospheric vignette — ties the photography into the page's dark
            frame and keeps the lower-third legible under the caption. */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#08090c] via-transparent to-[#08090c]/50 pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#08090c]/60 via-transparent to-[#08090c]/60 pointer-events-none" />

        <JourneyCarStage config={config} scrollYProgress={scrollYProgress} />

        <JourneyNarrative scrollYProgress={scrollYProgress} />
      </div>
    </section>
  )
}
